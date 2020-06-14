package main

import (
	"io"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
)

// 文件是否存在
func fileExists(filename string) bool {
	var exist = true
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		exist = false
	}
	return exist
}

// 写文件
func WriteFile(filename string, content string) bool {
	var f *os.File
	if fileExists(filename) {
		f, _ = os.OpenFile(filename, os.O_APPEND|os.O_TRUNC|os.O_WRONLY, os.ModeAppend)
	} else {
		if !fileExists(filepath.Dir(filename)) {
			os.MkdirAll(filepath.Dir(filename), os.ModePerm)
		}
		f, _ = os.Create(filename)
	}

	_, wErr := io.WriteString(f, content)
	if wErr != nil {
		return false
	}
	return true
}

// GetOnlyName gets the basename of a path and remove the extension
func GetOnlyName(fpath string) string {
	fullFilename := fpath
	filenameWithSuffix := path.Base(fullFilename)
	fileSuffix := path.Ext(filenameWithSuffix)
	filenameOnly := strings.TrimSuffix(filenameWithSuffix, fileSuffix)
	return filenameOnly
}

const (
	// tmpPermissionForDirectory makes the destination directory writable,
	// so that stuff can be copied recursively even if any original directory is NOT writable.
	// See https://github.com/otiai10/copy/pull/9 for more information.
	tmpPermissionForDirectory = os.FileMode(0755)
)

// Copy copies src to dest, doesn't matter if src is a directory or a file.
func Copy(src, dest string, opt ...Options) error {
	info, err := os.Lstat(src)
	if err != nil {
		return err
	}
	return switchboard(src, dest, info, assure(opt...))
}

// switchboard switches proper copy functions regarding file type, etc...
// If there would be anything else here, add a case to this switchboard.
func switchboard(src, dest string, info os.FileInfo, opt Options) error {
	switch {
	case info.Mode()&os.ModeSymlink != 0:
		return onsymlink(src, dest, info, opt)
	case info.IsDir():
		return dcopy(src, dest, info, opt)
	default:
		return fcopy(src, dest, info, opt)
	}
}

// copy decide if this src should be copied or not.
// Because this "copy" could be called recursively,
// "info" MUST be given here, NOT nil.
func copy(src, dest string, info os.FileInfo, opt Options) error {
	skip, err := opt.Skip(src)
	if err != nil {
		return err
	}
	if skip {
		return nil
	}
	return switchboard(src, dest, info, opt)
}

// fcopy is for just a file,
// with considering existence of parent directory
// and file permission.
func fcopy(src, dest string, info os.FileInfo, opt Options) (err error) {

	if err = os.MkdirAll(filepath.Dir(dest), os.ModePerm); err != nil {
		return
	}

	f, err := os.Create(dest)
	if err != nil {
		return
	}
	defer fclose(f, &err)

	if err = os.Chmod(f.Name(), info.Mode()|opt.AddPermission); err != nil {
		return
	}

	s, err := os.Open(src)
	if err != nil {
		return
	}
	defer fclose(s, &err)

	if _, err = io.Copy(f, s); err != nil {
		return
	}

	if opt.Sync {
		err = f.Sync()
	}

	return
}

// dcopy is for a directory,
// with scanning contents inside the directory
// and pass everything to "copy" recursively.
func dcopy(srcdir, destdir string, info os.FileInfo, opt Options) (err error) {

	originalMode := info.Mode()

	// Make dest dir with 0755 so that everything writable.
	if err = os.MkdirAll(destdir, tmpPermissionForDirectory); err != nil {
		return
	}
	// Recover dir mode with original one.
	defer chmod(destdir, originalMode|opt.AddPermission, &err)

	contents, err := ioutil.ReadDir(srcdir)
	if err != nil {
		return
	}

	for _, content := range contents {
		cs, cd := filepath.Join(srcdir, content.Name()), filepath.Join(destdir, content.Name())

		if err = copy(cs, cd, content, opt); err != nil {
			// If any error, exit immediately
			return
		}
	}

	return
}

func onsymlink(src, dest string, info os.FileInfo, opt Options) error {

	switch opt.OnSymlink(src) {
	case Shallow:
		return lcopy(src, dest)
	case Deep:
		orig, err := os.Readlink(src)
		if err != nil {
			return err
		}
		info, err = os.Lstat(orig)
		if err != nil {
			return err
		}
		return copy(orig, dest, info, opt)
	case Skip:
		fallthrough
	default:
		return nil // do nothing
	}
}

// lcopy is for a symlink,
// with just creating a new symlink by replicating src symlink.
func lcopy(src, dest string) error {
	src, err := os.Readlink(src)
	if err != nil {
		return err
	}
	return os.Symlink(src, dest)
}

// fclose ANYHOW closes file,
// with asiging error raised during Close,
// BUT respecting the error already reported.
func fclose(f *os.File, reported *error) {
	if err := f.Close(); *reported == nil {
		*reported = err
	}
}

// chmod ANYHOW changes file mode,
// with asiging error raised during Chmod,
// BUT respecting the error already reported.
func chmod(dir string, mode os.FileMode, reported *error) {
	if err := os.Chmod(dir, mode); *reported == nil {
		*reported = err
	}
}

// assure Options struct, should be called only once.
// All optional values MUST NOT BE nil/zero after assured.
func assure(opts ...Options) Options {
	if len(opts) == 0 {
		return getDefaultOptions()
	}
	defopt := getDefaultOptions()
	if opts[0].OnSymlink == nil {
		opts[0].OnSymlink = defopt.OnSymlink
	}
	if opts[0].Skip == nil {
		opts[0].Skip = defopt.Skip
	}
	return opts[0]
}

type Options struct {
	// OnSymlink can specify what to do on symlink
	OnSymlink func(src string) SymlinkAction
	// Skip can specify which files should be skipped
	Skip func(src string) (bool, error)
	// AddPermission to every entities,
	// NO MORE THAN 0777
	AddPermission os.FileMode
	// Sync file after copy.
	// Useful in case when file must be on the disk
	// (in case crash happens, for example),
	// at the expense of some performance penalty
	Sync bool
}

// SymlinkAction represents what to do on symlink.
type SymlinkAction int

const (
	// Deep creates hard-copy of contents.
	Deep SymlinkAction = iota
	// Shallow creates new symlink to the dest of symlink.
	Shallow
	// Skip does nothing with symlink.
	Skip
)

// getDefaultOptions provides default options,
// which would be modified by usage-side.
func getDefaultOptions() Options {
	return Options{
		OnSymlink: func(string) SymlinkAction {
			return Shallow // Do shallow copy
		},
		Skip: func(string) (bool, error) {
			return false, nil // Don't skip
		},
		AddPermission: 0,     // Add nothing
		Sync:          false, // Do not sync
	}
}

func IsFile(f string) bool {
	fi, e := os.Stat(f)
	if e != nil {
		return false
	}
	return !fi.IsDir()
}

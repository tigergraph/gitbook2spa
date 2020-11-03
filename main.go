package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/cheggaaa/pb/v3"
	log "github.com/sirupsen/logrus"
)

type Config struct {
	ZipFile   string
	Workdir   string
	WhiteList string
	Default   string
}

type VersionInfo struct {
	Uid         string        `json:"uid"`
	Title       string        `json:"title"`
	Kind        string        `json:"kind"`
	Description string        `json:"description"`
	Path        string        `json:"path"`
	Href        string        `json:"href"`
	DocumentURL string        `json:"documentURL"`
	CreatedAt   string        `json:"createdAt"`
	Pages       []VersionInfo `json:"pages"`
	Visited     bool          `json:"-"`
}

type Revision struct {
	Versions map[string]TopLevelVersion `json:"versions"`
}

type TopLevelVersion struct {
	Page VersionInfo `json:"page"`
}

type TaskInfo struct {
	ZipPath                  string
	WhiteList                []string
	Default                  string
	GitBookPath              string
	DistPath                 string
	ReactProjectTemplatePath string
}

type VersionRouteInfo struct {
	Component  string
	ImportPath string
	Version    string
}

type PageRouteInfo struct {
	Component  string
	ImportPath string
	PagePath   string
	PageUid    string
}

type AssetsInfo struct {
	Size int64
	Name string
}

type Section struct {
	Title   string
	Anchor  string
	Content string
}

type IndexData struct {
	Uid      string // file name as uid
	Path     string // URL path
	Page     string // from revision.json
	Sections []Section
}

func (c *Config) TaskInfo() *TaskInfo {
	t := TaskInfo{
		ZipPath:                  filepath.Join(c.Workdir, "zip"),
		WhiteList:                strings.Split(c.WhiteList, ","),
		Default:                  c.Default,
		GitBookPath:              filepath.Join(c.Workdir, "src", "gitbook"),
		DistPath:                 filepath.Join(c.Workdir, "dist"),
		ReactProjectTemplatePath: filepath.Join(c.Workdir, "react-project-template"),
	}
	return &t
}

var cfg Config
var task *TaskInfo

func main() {

	flag.StringVar(&cfg.ZipFile, "zip", "./gitbook.zip", "gitbook exported zip file path")
	flag.StringVar(&cfg.Workdir, "dir", "./", "working directory")
	flag.StringVar(&cfg.WhiteList, "white", "", "white list")
	flag.StringVar(&cfg.Default, "default", "", "default version")
	flag.Parse()
	task = cfg.TaskInfo()

	unzipSourceFiles(cfg.ZipFile)
	json2tsx()
	makeAppRoot()

	Copy("react-project-template", filepath.Join(cfg.Workdir, "src"))
	Copy("static", task.DistPath)
	Copy(filepath.Join(task.GitBookPath, "assets"), filepath.Join(task.DistPath, "assets"))

	makeAssetsPath()
	makeHtmlTemplate()
}

// unzipSourceFiles decompress the zip file
func unzipSourceFiles(fileName string) {
	log.Printf("unzip %v to %v", cfg.ZipFile, task.GitBookPath)
	_, err := Unzip(cfg.ZipFile, task.GitBookPath)
	if err != nil {
		log.Fatal(err)
	}
}

// 生成依赖文件的映射关系
func makeAssetsPath() {
	log.Infof("moving assets from %v", task.GitBookPath)
	pathJSON := map[string]AssetsInfo{}

	WalkDir(filepath.Join(task.GitBookPath, "assets"), func(filePath string, filename string) {
		fileName := filename
		file, _ := os.Stat(filePath)
		pathJSON[fileName] = AssetsInfo{
			Size: file.Size(),
			Name: file.Name(),
		}
	})

	marshalpathJSON, _ := json.Marshal(pathJSON)
	pathJSONStr := string(marshalpathJSON)

	WriteFile(filepath.Join(task.GitBookPath, "assets.js"), "module.exports = "+pathJSONStr)
}

// json2tsx generates typescripts for react project based on the JSON files
func json2tsx() {
	originDirPath := filepath.Join(task.GitBookPath, "versions")
	targetDirPath := filepath.Join(task.GitBookPath, "versions")

	// Read dir under "/build_temp/src/gitbook/versions"
	fileinfoList, err := ioutil.ReadDir(originDirPath)

	if err != nil {
		log.Fatal(err)
	}
	for i := range fileinfoList {
		versionName := fileinfoList[i].Name()

		// Generate document index by version for full-text search
		genSearchIndex(versionName)

		if !strings.Contains(filepath.Join(originDirPath, versionName), ".DS_Store") {
			formatTargetVersion(
				filepath.Join(originDirPath, versionName),
				filepath.Join(targetDirPath, versionName),
				versionName,
			)
		}
	}
}

// 获得指定版本内的json文件
func formatTargetVersion(versionPath string, targetDir string, versionName string) {
	// Read dir under "/build_temp/src/gitbook/versions/${versionName}"
	fileinfoList, err := ioutil.ReadDir(versionPath)

	if err != nil {
		log.Fatal(err, versionPath)
	}
	log.Infof("converting json into typescript files for: %v", versionPath)
	bar := pb.StartNew(len(fileinfoList))
	defer bar.Finish()
	for i := range fileinfoList {
		fileName := fileinfoList[i].Name()
		jsonPath := filepath.Join(versionPath, fileName)
		pageUID := GetBasenamePrefix(jsonPath)
		if WriteFile(filepath.Join(targetDir, pageUID+".tsx"), makeTSX(jsonPath, versionName, pageUID)) {
			// Remove document in JSON format after transformation to .tsx is finished
			os.Remove(jsonPath)
		} else {
			log.Warn(pageUID, ".tsx creation failed")
		}
		bar.Increment()
	}
}

// 最后的html文件的模版函数
func makeHtmlTemplate() {
	template := `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="shortcut icon" href="/static/favicon.ico" type="image/x-icon">

        <style>
            html,
            body {
                color: #242A31;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                font-size: 15px;
                box-sizing: border-box;
                font-family: "Roboto", sans-serif;
                line-height: 1em;
                font-smoothing: antialiased;
                text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                -webkit-text-size-adjust: 100%;
            }
        </style>
        <title>TigerGraph Documentation</title>
    </head>

    <body>
        <div id='root'></div>

        <script type="text/javascript" src='/vendor.js'></script>
        <script type="text/javascript" src='/bundle.js'></script>
    </body>

    </html>
	`

	WriteFile(filepath.Join(task.DistPath, "index.html"), template)
}

// 将转译好的jsx字符串写至tsx模版文件
func makeTSX(jsonPath string, versionName string, pageUID string) string {
	htmlDom := Parser(jsonPath, versionName, pageUID)
	return RenderTsxTemplate(htmlDom)
}

// 获取目录下所有文件
func WalkDir(path string, cb func(filePath string, filename string)) {
	files, err := ioutil.ReadDir(path)
	if err != nil {
		fmt.Println(err.Error())
	} else {
		for _, v := range files {
			p := filepath.Join(path, v.Name())
			if v.IsDir() {
				WalkDir(p, cb)
			} else {
				cb(p, v.Name())
			}
		}
	}
}

// 生成spa的入口文件并且也是一个路由部分，里面包含了各版本目录下的的路由入口文件
func makeAppRoot() {
	appRootPath := filepath.Join(task.GitBookPath, "_appRoute.tsx")
	versionDirPath := filepath.Join(task.GitBookPath, "versions")
	versions, _ := ioutil.ReadDir(versionDirPath)
	versionList := []VersionRouteInfo{}

	for i, v := range versions {
		for _, w := range task.WhiteList {
			if w == v.Name() {
				name := filepath.Base(v.Name())
				fileInfo, _ := os.Stat(filepath.Join(versionDirPath, name))
				if fileInfo.IsDir() {
					makeVersionRoot(name)
				}

				versionList = append(versionList, VersionRouteInfo{
					Component:  fmt.Sprintf("Version_%v", i),
					ImportPath: fmt.Sprintf("import Version_%v from './versions/%v/_versionRoute';", i, name),
					Version:    strings.Replace(name, ".tsx", "", 1),
				})
			}
		}

	}

	if len(versionList) == 0 {
		return
	}

	routeImportPath := ""
	routesElements := ""
	defaultVersion := versionList[0].Version

	if len(task.Default) > 0 {
		defaultVersion = task.Default
	}

	defaultRoute := fmt.Sprintf("<Redirect to={'/%v'}/>", defaultVersion)

	for _, v := range versionList {
		routeImportPath += v.ImportPath + "\n"
		routesElements += fmt.Sprintf("<Route path={'/%v'} component={%v} />", v.Version, v.Component) + "\n"
	}

	content := fmt.Sprintf(`
	import * as React from 'react'
	import * as ReactDom from 'react-dom'
    import { Route, Redirect, Switch } from 'react-router';
    import { BrowserRouter } from 'react-router-dom';
	import 'antd/dist/antd.css';
	import 'katex/dist/katex.min.css';
	import '../styles/global.css';
    %v
	const revision = require('./revision-lite.json');
	const space = require('./space.json');
    (window as any)['revision'] = revision;
    (window as any)['space'] = space;
    (window as any)['whiteList'] = "%v";

	// versions
    const App = () => {
        return <BrowserRouter>
            <Switch>
                %v
                %v
            </Switch>
        </BrowserRouter>
    }

    ReactDom.render(<App />, document.getElementById('root'));
    `, routeImportPath, strings.Join(task.WhiteList, ","), routesElements, defaultRoute)

	WriteFile(appRootPath, content)
}

// 生成版本目录下的的路由入口文件
func makeVersionRoot(versionName string) {
	versionPath := filepath.Join(task.GitBookPath, "versions", versionName)
	versionRootPath := filepath.Join(versionPath, "_versionRoute.tsx")
	pages, _ := ioutil.ReadDir(versionPath)

	revisionJSON, _ := ioutil.ReadFile(filepath.Join(task.GitBookPath, "revision.json"))
	revision := Revision{}
	json.Unmarshal(revisionJSON, &revision)
	currentVersion := revision.Versions[versionName]

	pagesList := []PageRouteInfo{}

	for i, v := range pages {
		name := filepath.Base(v.Name())
		targetUid := strings.Replace(name, ".tsx", "", 1)
		_path := ""

		if currentVersion.Page.Uid == targetUid {
			_path = currentVersion.Page.Path
		} else if len(currentVersion.Page.Pages) != 0 {
			pageInfo, ok := deepFindPage(currentVersion.Page.Path, currentVersion.Page.Pages, targetUid)
			if ok {
				_path = pageInfo.Path
			}
		}

		pagesList = append(pagesList, PageRouteInfo{
			Component:  fmt.Sprintf(`Page_%v`, i),
			ImportPath: fmt.Sprintf(`import Page_%v from './%v';`, i, GetBasenamePrefix(name)),
			PagePath:   _path,
			PageUid:    targetUid,
		})
	}

	// Write content to revision-lite.json
	revisionLiteJSON, err := ioutil.ReadFile(filepath.Join(task.GitBookPath, "revision-lite.json"))

	updatedRevision, _ := json.Marshal(revision)

	if err == nil {
		revisionLite := Revision{}
		json.Unmarshal(revisionLiteJSON, &revisionLite)

		revisionLite.Versions[versionName] = revision.Versions[versionName]
		updatedRevision, _ = json.Marshal(revisionLite)
	}

	WriteFile(filepath.Join(task.GitBookPath, "revision-lite.json"), string(updatedRevision))

	routeImportPath := ""
	routesElements := ""
	defaultRoute := ""

	for _, v := range pagesList {
		routeImportPath += v.ImportPath + "\n"

		if v.PagePath == "master" {
			routesElements += fmt.Sprintf("<Route path={`${props.match.url}`} exact component={%v} />", v.Component) + "\n"
			defaultRoute = "<Redirect to={`${props.match.url}`}/>"
		} else {
			routesElements += fmt.Sprintf("<Route path={`${props.match.url}/%v`} exact component={%v} />", v.PagePath, v.Component) + "\n"
		}
	}

	content := fmt.Sprintf(`
	import * as React from 'react'
	import { Route, withRouter, Redirect, Switch } from 'react-router';
	%v

	export default withRouter(props => {
		return <Switch>
			%v
			%v
	    </Switch>
	})`, routeImportPath, routesElements, defaultRoute)

	WriteFile(versionRootPath, content)
}

// 根据目标uid递归寻找revision下的page json
func deepFindPage(parentPath string, childPages []VersionInfo, targetUid string) (VersionInfo, bool) {
	for i := range childPages {
		// Skip the path of top level page which call `deepFindPage()`
		if parentPath != "master" && !childPages[i].Visited {
			childPages[i].Visited = true
			childPages[i].Path = fmt.Sprintf("%v/%v", parentPath, childPages[i].Path)
		}

		if childPages[i].Uid == targetUid {
			return childPages[i], true
		}

		if len(childPages[i].Pages) != 0 {
			childPage, ok := deepFindPage(childPages[i].Path, childPages[i].Pages, targetUid)
			if ok {
				return childPage, ok
			}
		}
	}

	return VersionInfo{}, false
}

func genSearchIndex(versionName string) {
	versionPath := filepath.Join(task.GitBookPath, "versions", versionName)

	revisionJSON, _ := ioutil.ReadFile(filepath.Join(task.GitBookPath, "revision.json"))
	revision := Revision{}
	json.Unmarshal(revisionJSON, &revision)

	// For full-text search index
	versionIndex := ProcessRevision(revision, versionName)

	for i, page := range versionIndex {
		// Read document
		filename := page.Uid + ".json"
		docJSON, _ := ioutil.ReadFile(filepath.Join(versionPath, filename))

		doc := JSONInfo{}
		err := json.Unmarshal(docJSON, &doc)

		if err != nil {
			return
		}

		// Fill content to index
		sections := []Section{}
		doc.Document.CollectIndexContent(&sections, false, true, map[string]int{})

		versionIndex[i].Sections = sections
	}

	versionIndexJSON, _ := JSONMarshal(versionIndex)
	indexFilename := versionName + ".json"

	WriteFile(filepath.Join(task.GitBookPath, "search-index", indexFilename), string(versionIndexJSON))
}

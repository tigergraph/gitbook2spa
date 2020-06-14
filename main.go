package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
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
}

type Revision struct {
	Versions map[string]TopLevelVersion
}

type TopLevelVersion struct {
	Page VersionInfo
}

type TaskInfo struct {
	ZipPath                  string
	WhiteList                []string
	Default                  string
	SrcPath                  string
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

func (c *Config) TaskInfo() *TaskInfo {
	t := TaskInfo{
		ZipPath:                  filepath.Join(c.Workdir, "zip"),
		WhiteList:                strings.Split(c.WhiteList, ","),
		Default:                  c.Default,
		SrcPath:                  filepath.Join(c.Workdir, "source", "source"),
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

	Copy("react-project-template", filepath.Join(cfg.Workdir, "source"))
	Copy("static", task.DistPath)
	Copy(filepath.Join(task.SrcPath, "assets"), filepath.Join(task.DistPath, "assets"))

	makeAssetsPath()
	makeHtmlTemplate()
}

// 解压待处理文件
func unzipSourceFiles(fileName string) {
	Unzip(cfg.ZipFile, task.SrcPath)
}

// 生成依赖文件的映射关系
func makeAssetsPath() {
	pathJson := map[string]AssetsInfo{}

	WalkDir(filepath.Join(task.SrcPath, "assets"), func(filePath string, filename string) {
		fileName := filename
		file, _ := os.Stat(filePath)
		fmt.Println(file.Name())
		pathJson[fileName] = AssetsInfo{
			Size: file.Size(),
			Name: file.Name(),
		}
	})

	marshalpathJson, _ := json.Marshal(pathJson)
	pathJsonStr := string(marshalpathJson)

	WriteFile(filepath.Join(task.SrcPath, "assets.js"), "module.exports = "+pathJsonStr)
}

// 将json转为tsx的入口函数
func json2tsx() {
	originDirPath := filepath.Join(task.SrcPath, "versions")
	targetDirPath := filepath.Join(task.SrcPath, "versions")
	fileinfoList, err := ioutil.ReadDir(originDirPath)

	if err != nil {
		log.Fatal(err)
	}
	for i := range fileinfoList {
		versionName := fileinfoList[i].Name()
		if !strings.Contains(filepath.Join(originDirPath, versionName), ".DS_Store") {
			formatTargetVersion(
				filepath.Join(originDirPath, versionName),
				filepath.Join(targetDirPath, versionName),
			)
		}
	}
}

// 获得指定版本内的json文件
func formatTargetVersion(versionPath string, targetDir string) {
	fileinfoList, err := ioutil.ReadDir(versionPath)

	if err != nil {
		log.Fatal(err, versionPath)
	}
	for i := range fileinfoList {
		fileName := fileinfoList[i].Name()
		version := strings.Split(versionPath, "/")
		parseJSON(filepath.Join(versionPath, fileName), targetDir, version[len(version)-1])
	}
}

// 解析json,并在指定目录生成对应的.html/.tsx
func parseJSON(jsonPath string, targetPath string, version string) {
	onlyFileName := GetOnlyName(jsonPath)
	if WriteFile(filepath.Join(targetPath, onlyFileName+".tsx"), makeTSX(jsonPath)) {
		os.Remove(jsonPath)
		fmt.Println(onlyFileName, "tsx created")
	} else {
		fmt.Println(onlyFileName, "tsx creation failed")
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
        
        <script type="text/javascript" src='/bundle.js'></script>
    </body>
    
    </html>
	`

	WriteFile(filepath.Join(task.DistPath, "index.html"), template)
}

// 将转译好的jsx字符串写至tsx模版文件
func makeTSX(jsonPath string) string {
	htmlDom := Parser(jsonPath)
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
	appRootPath := filepath.Join(task.SrcPath, "_appRoute.tsx")
	versionDirPath := filepath.Join(task.SrcPath, "versions")
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
    %v
	const reversion = require('./revision.json');
    (window as any)['reversion'] = reversion;
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
func makeVersionRoot(version string) {

	versionPath := filepath.Join(task.SrcPath, "versions", version)
	versionRootPath := filepath.Join(versionPath, "_versionRoute.tsx")
	pages, _ := ioutil.ReadDir(versionPath)

	pagesList := []PageRouteInfo{}

	for i, v := range pages {
		name := filepath.Base(v.Name())
		revisionJSON, _ := ioutil.ReadFile(filepath.Join(task.SrcPath, "revision.json"))
		targetUid := strings.Replace(name, ".tsx", "", 1)
		revision := Revision{}
		json.Unmarshal(revisionJSON, &revision)
		currentVersion := revision.Versions[version]
		_path := ""

		if currentVersion.Page.Uid == targetUid {
			_path = currentVersion.Page.Path
		} else if len(currentVersion.Page.Pages) != 0 {
			pageInfo, ok := deepFindPage(currentVersion.Page.Pages, targetUid)
			if ok {
				_path = pageInfo.Path
			}
		}

		pagesList = append(pagesList, PageRouteInfo{
			Component:  fmt.Sprintf(`Page_%v`, i),
			ImportPath: fmt.Sprintf(`import Page_%v from './%v';`, i, GetOnlyName(name)),
			PagePath:   _path,
			PageUid:    targetUid,
		})
	}

	routeImportPath := ""
	routesElements := ""
	defaultRoute := ""

	for _, v := range pagesList {
		routeImportPath += v.ImportPath + "\n"
		routesElements += fmt.Sprintf("<Route path={`${props.match.url}/%v`} exact component={%v} />", v.PageUid, v.Component) + "\n"
		if v.PagePath == "master" {
			defaultRoute = fmt.Sprintf("<Redirect to={`${props.match.url}/%v`}/>", v.PageUid)
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
func deepFindPage(pages []VersionInfo, targetUid string) (VersionInfo, bool) {
	for _, page := range pages {
		if page.Uid == targetUid {
			return page, true
		}
		if len(page.Pages) != 0 {
			childPage, ok := deepFindPage(page.Pages, targetUid)
			if ok {
				return childPage, ok
			}
		}
	}

	return VersionInfo{}, false
}

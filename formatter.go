package main

import (
	"encoding/json"
	"io/ioutil"
)

// text类型dom的属性，标记各类样式比如斜体、加粗...
type Marks struct {
	Kind string      `json:"kind"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// 多段text的父级结构
type Ranges struct {
	Kind  string  `json:"kind"`
	Text  string  `json:"text"`
	Marks []Marks `json:"marks"`
}

// dom json可能会取出的数据部分,主要用作影响dom的不同样式功能
type Data struct {
	Href    string    `json:"href,omitempty"`
	Checked *bool     `json:"checked,omitempty"`
	AssetID string    `json:"assetID,omitempty"`
	ImgSize string    `json:"size,omitempty"`
	PageID  string    `json:"pageID,omitempty"`
	Caption string    `json:"caption,omitempty"`
	Aligns  *[]string `json:"aligns,omitempty"`
	Style   string    `json:"style,omitempty"`
	Page    string    `json:"page,omitempty"`
	Title   string    `json:"title,omitempty"`
	Syntax  string    `json:"syntax,omitempty"`
	Code    string    `json:"code,omitempty"`
	Formula string    `json:"formula,omitempty"`
}

// 页面json的基本结构
type NodeTree struct {
	Kind   string     `json:"kind"`
	Type   string     `json:"type"`
	Key    string     `json:"key"`
	Data   Data       `json:"data"`
	Nodes  []NodeTree `json:"nodes"`
	Ranges []Ranges   `json:"ranges"`
}

// 页面json的根结构
type JSONInfo struct {
	FormatVersion int64    `json:"format_version"`
	Document      NodeTree `json:"document"`
}

// 格式化json文件的入口
func Parser(jsonPath string) string {
	v := JSONInfo{}
	Load(jsonPath, &v)
	return Render(v.Document)
}

// 读取json文件
func Load(filename string, v interface{}) {
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return
	}

	err = json.Unmarshal(data, &v)
	if err != nil {
		return
	}
}

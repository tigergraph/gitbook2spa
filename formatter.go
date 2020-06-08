package main

import (
	"encoding/json"
	"io/ioutil"
)

type Marks struct {
	Kind string      `json:"kind"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type Ranges struct {
	Kind  string  `json:"kind"`
	Text  string  `json:"text"`
	Marks []Marks `json:"marks"`
}

type Data struct {
	Href    string    `json:"href,omitempty"`
	Checked *bool     `json:"checked,omitempty"`
	AssetID string    `json:"assetID,omitempty"`
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

type NodeTree struct {
	Kind   string     `json:"kind"`
	Type   string     `json:"type"`
	Key    string     `json:"key"`
	Data   Data       `json:"data"`
	Nodes  []NodeTree `json:"nodes"`
	Ranges []Ranges   `json:"ranges"`
}

type JSONInfo struct {
	FormatVersion int64    `json:"format_version"`
	Document      NodeTree `json:"document"`
}

func Parser(jsonPath string) string {
	v := JSONInfo{}
	Load(jsonPath, &v)
	return Render(v.Document)
}

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

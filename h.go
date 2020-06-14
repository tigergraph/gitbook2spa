package main

import "encoding/json"

// 字符串属性结构
type AttrStringStruct struct {
	Key   string
	Value string
}

// 对象属性结构
type AttrInterfaceStruct struct {
	Key   string
	Value interface{}
}

// 生成一个element tag
func H(eleName string, child string, attr string) string {
	return "<" + eleName + attr + ">" + child + "</" + eleName + ">"
}

// 返回一串value为字符串的props字符串
func AttrString(attr []AttrStringStruct) string {
	a := " "
	if len(attr) > 0 {
		for i := range attr {
			a += attr[i].Key + `="` + attr[i].Value + `" `
		}
	}
	return a
}

// 返回一串value为对象的props字符串
func AttrInterface(attr []AttrInterfaceStruct) string {
	a := " "
	if len(attr) > 0 {
		for i := range attr {
			atr, _ := json.Marshal(attr[i].Value)
			if string(atr) == "{}" {
				continue
			}
			a += attr[i].Key + `={` + string(atr) + `} `
		}
	}
	return a
}

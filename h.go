package main

import "encoding/json"

type AttrStringStruct struct {
	Key   string
	Value string
}

type AttrInterfaceStruct struct {
	Key   string
	Value interface{}
}

func H(eleName string, child string, attr string) string {
	return "<" + eleName + attr + ">" + child + "</" + eleName + ">"
}

func AttrString(attr []AttrStringStruct) string {
	a := " "
	if len(attr) > 0 {
		for i := range attr {
			a += attr[i].Key + `="` + attr[i].Value + `" `
		}
	}
	return a
}

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

package main

import (
	"strings"
)

func RenderBlock(n *NodeTree, child string) string {
	attrWithType := []AttrStringStruct{{
		Key:   "type",
		Value: n.Type,
	}}
	attrWithData := []AttrInterfaceStruct{{
		Key:   "data",
		Value: n.Data,
	}}
	attrWithKey := []AttrInterfaceStruct{{
		Key:   "key",
		Value: n.Key,
	}}
	return H("Block", child, AttrString(attrWithType)+AttrInterface(attrWithData)+AttrInterface(attrWithKey))
}

func RenderDocument(n *NodeTree, child string) string {
	attr := []AttrStringStruct{{
		Key:   "type",
		Value: n.Type,
	}}
	attrWithKey := []AttrInterfaceStruct{{
		Key:   "key",
		Value: n.Key,
	}}
	return H("Document", child, AttrString(attr)+AttrInterface(attrWithKey))
}

func RenderInline(n *NodeTree, child string) string {
	typeAttr := []AttrStringStruct{{
		Key:   "type",
		Value: n.Type,
	}}

	attrWithKey := []AttrInterfaceStruct{{
		Key:   "key",
		Value: n.Key,
	}}

	text := ""

	if (n.Data != Data{}) {
		attr := []AttrInterfaceStruct{{
			Key:   "data",
			Value: n.Data,
		}}
		text += H("Inline", child, AttrString(typeAttr)+AttrInterface(attr)+AttrInterface(attrWithKey))
	} else {
		text += H("Inline", child, AttrString(typeAttr)+AttrInterface(attrWithKey))
	}
	return text
}

func RenderMark(n *NodeTree, child string) string {
	attrWithKey := []AttrInterfaceStruct{{
		Key:   "key",
		Value: n.Key,
	}}
	return H("Mark", child, ""+AttrInterface(attrWithKey))
}

func RenderText(n *NodeTree, child string) string {
	text := ""
	if len(n.Ranges) > 0 {
		for i := range n.Ranges {
			attrWithKey := []AttrInterfaceStruct{{
				Key:   "key",
				Value: n.Key + string(i),
			}}
			content := n.Ranges[i].Text

			if strings.ContainsAny(content, "{&}&<&>&`&\n") {
				content = transfer(content, '{', '}', '<', '>', '`')
			}

			if len(n.Ranges[i].Marks) > 0 {
				attr := []AttrInterfaceStruct{{
					Key:   "marks",
					Value: n.Ranges[i].Marks,
				}}
				text += H("Text", content, AttrInterface(attr)+AttrInterface(attrWithKey))
			} else {
				text += H("Text", content, ""+AttrInterface(attrWithKey))
			}
		}
	}

	return text
}

func transfer(s string, char ...byte) string {
	for i := 0; i < len(s); i++ {
		for _, c := range char {
			if s[i] == c {
				s = s[:i] + `{"` + string(c) + `"}` + s[i+1:]
				i += 4
				break
			}
			if s[i] == '\n' {
				if i == len(s)-1 && s != string('\n') {
					s = s[:i] + `<span style={{display: "block"}}><br/></span>` + s[i+1:]
					return s
				} else {
					s = s[:i] + "<br/>" + s[i+1:]
					i += 4
				}
				break
			}
		}
	}
	return s
}

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

type indexNode interface {
	genIndex() string
	traverseChild() []NodeTree
}

// Generate root index JSON from `revision.json` with specified version name
func ProcessRevision(revision Revision, versionName string) []IndexData {
	result := []IndexData{}

	currentVersion := revision.Versions[versionName]

	// For current version document
	result = append(result, IndexData{
		Uid:  currentVersion.Page.Uid,
		Page: currentVersion.Page.Title,
		Path: "",
	})

	// For other pages
	traversePages(currentVersion.Page, &result)

	return result
}

func traversePages(parentPage VersionInfo, result *[]IndexData) {
	childPages := parentPage.Pages

	// Find if any child page exists
	for i := range childPages {
		// Only add `document` to index
		if childPages[i].Kind == "document" {
			// Skip the the path of top level page
			if parentPage.Path != "master" && !childPages[i].Visited {
				childPages[i].Visited = true
				childPages[i].Path = fmt.Sprintf("%v/%v", parentPage.Path, childPages[i].Path)
			}

			*result = append(*result, IndexData{
				Uid:  childPages[i].Uid,
				Page: childPages[i].Title,
				Path: childPages[i].Path,
			})
		}

		if len(childPages[i].Pages) != 0 {
			traversePages(childPages[i], result)
		}
	}
}

var newSection = Section{}

// Use `resultCollector` to collect index data
func (n *NodeTree) CollectIndexContent(resultCollector *[]Section, meetHeading bool, isTopLevel bool, anchorMap map[string]int) string {
	if n.Type == "heading-1" || n.Type == "heading-2" {
		// collect section before
		// There are two situations here: no heading but has content or has both heading and content.
		// Except the last section, No matter what it will be add to array util it meet next heading.
		if meetHeading || newSection.Content != "" {
			*resultCollector = append(*resultCollector, newSection)
		}

		meetHeading = true

		title := n.Nodes[0].Ranges[0].Text

		// Invalid title
		if strings.HasPrefix(title, "\n") {
			title = ""
		}

		src := strings.ToLower(title)

		// add a space between 'v' and 'version number'
		versionRegexp := regexp.MustCompile(`v(\d+)`)
		anchor := versionRegexp.ReplaceAllString(src, "v $1")

		// replace '&' with 'and'
		anchor = strings.ReplaceAll(anchor, "&", "and")

		// replace all the special characters with space
		patter1 := `[,.?:()'"/!*+=\-\[\]]`
		reg1 := regexp.MustCompile(patter1)
		anchor = reg1.ReplaceAllString(anchor, " ")

		// replace all spaces with dash
		patter2 := `\b\s+\b`
		reg2 := regexp.MustCompile(patter2)
		anchor = reg2.ReplaceAllString(anchor, "-")

		anchor = strings.TrimSpace(anchor)

		// store the number of duplicate anchor
		anchorMap[anchor]++

		if anchorMap[anchor] != 1 {
			// add number suffix to duplicate anchor
			anchor += "_" + strconv.Itoa(anchorMap[anchor])
		}

		// create a new section
		newSection = Section{
			Title:   title,
			Anchor:  anchor,
			Content: "",
		}

		// Skip heading as content
		return ""
	}

	if len(n.Nodes) > 0 {
		for i, curNode := range n.Nodes {
			if curNode.Type == "paragraph" {
				strAfterTrim := strings.TrimSpace(curNode.CollectIndexContent(resultCollector, meetHeading, false, anchorMap))
				newSection.Content += strAfterTrim + " "
			} else {
				newSection.Content += curNode.CollectIndexContent(resultCollector, meetHeading, false, anchorMap)
			}

			// Add the last section
			if isTopLevel && i == len(n.Nodes)-1 {
				*resultCollector = append(*resultCollector, newSection)

				// Reset `newSection`
				newSection = Section{}
			}
		}
	}

	return extractText(n)
}

// Read and join content
func extractText(n *NodeTree) string {
	text := ""

	if len(n.Ranges) > 0 {
		for i := range n.Ranges {
			text += strings.ReplaceAll(n.Ranges[i].Text, "\n", "")
		}
	}

	return text
}

// Transform to JSON without escaped character
func JSONMarshal(t interface{}) ([]byte, error) {
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false) // not escape <, >, &
	err := encoder.Encode(t)
	return buffer.Bytes(), err
}

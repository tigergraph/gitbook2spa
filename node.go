package main

type node interface {
	RenderHTML() string
	RenderChild() []NodeTree
}

func Render(json NodeTree) string {
	return json.RenderHTML()
}

// 返回element tag字符串
func (n *NodeTree) RenderHTML() string {
	nodesResult := n.RenderNodes()

	switch n.Kind {
	case "document":
		return RenderDocument(n, nodesResult)
	case "block":
		return RenderBlock(n, nodesResult)
	case "text":
		return RenderText(n, nodesResult)
	case "inline":
		return RenderInline(n, nodesResult)
	case "mark":
		return RenderMark(n, nodesResult)
	}

	return "<Document><Recommend/></Document>"
}

// nodes在revision.json下为每个元素内子元素的数组，此处递归转译它来达到转译整个页面的目的
func (n *NodeTree) RenderNodes() string {
	result := ""

	if len(n.Nodes) > 0 {
		for i := range n.Nodes {
			result += n.Nodes[i].RenderHTML()
		}
	}
	return result
}

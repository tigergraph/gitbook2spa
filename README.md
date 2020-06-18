# Gitbook to SPA

## Introduction

This tool is used to convert Gitbook exported data into a React SPA project

## Docker Image

To serve document locally, simply run:

```
docker run -p 8080:80 tgexternal/document:latest
```

Then access from `http://localhost:8080/`

## Usage

### Install Dependencies:

- [Node JS](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

### Build

- build SPA: `make release/doc`
- build docker image: `make docker-image`

Check makefile for more details.



## How does it work


### Introduction
There are two parts of this project: 

1. Go parser and code generator under the root
2. React template under `react-project-template`

The workflow is shown as below:
![introduce](./introduce.png "introduce")


### File structure

```
├── formatter.go: entrypoint of formatting tsx files
├── fs.go: i/o utilities
├── h.go: element tag generator
├── node.go: json->react dom
├── static: static files including favicon and logo
├── template.go: template for tsx files
├── render.go: render tags into tsx code
├── react-project-template: front-end spa project template
    ├── lib: utility methods
        ├── CreateMathComponent.tsx: math component renderer
        ├── OnHover.tsx: wrapper for hovering component
        ├── checkType.ts: element tag matcher
        ├── findChildType.ts: recursively find the matching first element with tag
        ├── findPage.ts: search page information from revision.json
        ├── mergeClassName.ts: merge class name
        └── renderFileSize.ts: file size renderer
    ├── parts: basic rendering components
    ├── server.js: used to for development
```

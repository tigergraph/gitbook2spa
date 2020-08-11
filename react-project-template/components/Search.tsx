import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Drawer, Input, Tooltip } from "antd";
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Fuse from "fuse.js";
import debounce from "lodash.debounce";

import styles from '@styles/header.module.css'

const { Search: SearchInput } = Input;

interface IndexData {
    Uid: string
    Path: string
    Page: string
    Sections: Section[]
}

interface Section {
    Title: string
    Anchor: string
    Content: string
    displayTitle?: boolean
    displayContent?: boolean
    exactMatch?: boolean
}

interface PositionObject {
    start: number
    end: number
}

type RangeTuple = [number, number]

let data: any[] = [];
let fuse: any;
let currentVersion = '';

export const Search: React.FC = () => {
    const [searchResult, setSearchResult] = useState([]);
    const [visible, setVisible] = React.useState(false);

    const history = useHistory();

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const buildIndex = () => {
        const selectedVersion = history.location.pathname.split('/')[1];

        if (
            currentVersion === '' ||  // app init
            (selectedVersion && currentVersion !== selectedVersion)  // switch to another version
        ) {
            // dynamically import json file with specified version
            import(`@gitbook/search-index/${selectedVersion}.json`)
                .then(module => {
                    data = module.default;
                    currentVersion = selectedVersion; // remember selected version name

                    // https://fusejs.io/api/options.html
                    fuse = new Fuse(data, {
                        // findAllMatches: true,
                        includeMatches: true,
                        includeScore: true,
                        minMatchCharLength: 3,
                        shouldSort: true,
                        threshold: 0.2,
                        ignoreLocation: true,
                        distance: 100000,
                        // ignoreFieldNorm: true, // The shorter the field, the higher its relevance
                        useExtendedSearch: true,
                        keys: ["Page", "Sections.Title", "Sections.Content"],
                        sortFn: (a, b) => {
                            if (a.score === 1 && b.score !== 1) {
                                return -1;
                            } else if (b.score === 1 && a.score !== 1) {
                                return 1;
                            } else {
                                if(a.score === 1 && b.score === 1) {
                                    if((a.matches || []).length > (b.matches || []).length) {
                                        return -1;
                                    } else {
                                        return 1;
                                    }
                                }

                                return a.score - b.score;
                            }
                        }
                    });
                });
        }
    };

    useEffect(() => {
        buildIndex();
    }, [buildIndex]);

    const handleSearch = (query: string) => {

        if (query.length < 3) {
            setSearchResult([]);

            return;
        }

        const doSearch = debounce(
            () => {
                if (fuse) {
                    // https://fusejs.io/examples.html#extended-search
                    // this pattern contains include and fuzzy match
                    const pattern = `'${query} | ${query}`;

                    const res = fuse.search(pattern); // find the item include query string

                    setSearchResult(searchHighlight(res, query));
                }
            },
            500,
            {
                leading: true,
                trailing: false
            }
        );

        doSearch();
    };

    const clickOnResult = (pagePath: string, anchor: string = '') => {
        const path = anchor
            ? `/${currentVersion}/${pagePath}#${anchor}`
            : `/${currentVersion}/${pagePath}`;

        history.push(path);

        // scroll to anchor element
        if (anchor) {
            setTimeout(() => {
                const elem = document.querySelector(`#${anchor}`);
                elem && elem.scrollIntoView();
            }, 150);
        }

        setVisible(false);
    };

    const renderResult = (res: IndexData[]) => {
        return res.map(item => {
            return (
                <li className={styles.matchedItem} key={item.Path}>
                    <div className={styles.pageName}>
                        <div
                            className={styles.pageNameText}
                            dangerouslySetInnerHTML={{__html: item.Page}}
                            onClick={() => clickOnResult(item.Path)}
                        />
                    </div>

                    {item.Sections.map((section, index) => (
                        <section
                            className={styles.section}
                            key={index}
                            onClick={() => clickOnResult(item.Path, section.Anchor)}
                        >
                            <div
                                className={styles.sectionTitle}
                                dangerouslySetInnerHTML={{__html: section.Title}}
                            />
                            <div
                                className={styles.sectionContent}
                                dangerouslySetInnerHTML={{__html: section.Content}}
                            />
                        </section>
                    ))}
                </li>
            );
        });
    };

    const drawerTitle = (
        <div className={styles.searchInputContainer}>
            <SearchInput
                className={styles.searchInput}
                size={"large"}
                placeholder="input search text"
                allowClear={true}
                onSearch={value => handleSearch(value)}
            />

            <Tooltip
                className={styles.searchTooltip}
                title={
                    <ol style={{paddingLeft: 20, margin: 0}}>
                        <li>Searched term should be more than 2 letters</li>
                        <li>Press enter can also do search</li>
                    </ol>
                }
                placement={"bottomRight"}
            >
                <InfoCircleOutlined style={{color: 'rgba(0, 0, 0, 0.45)'}}/>
            </Tooltip>
        </div>
    );

    return (
        <div className={styles.searchContainer}>
            <Button
                className={styles.searchButton}
                size={"large"}
                icon={<SearchOutlined />}
                onClick={showDrawer}
            >
                Search
            </Button>

            <Drawer
                title={drawerTitle}
                width={400}
                placement="right"
                closable={false}
                onClose={onClose}
                visible={visible}
            >
                <div className={styles.searchResultContainer}>
                    <ul className={styles.searchResult}>
                        {Array.isArray(searchResult) && searchResult.length !== 0
                            ? renderResult(searchResult)
                            : null
                        }
                    </ul>
                </div>
            </Drawer>
        </div>
    );
};

const searchHighlight = (res: Fuse.FuseResult<IndexData>, query: string) => {
    const searchText = query.toLowerCase().trim();

    const filteredRes = JSON.parse(JSON.stringify(res)).map((data: Fuse.FuseResult<IndexData>) => {
        if (data.score === 1) {
            // exact match
            if (data.item.Page.toLowerCase().includes(searchText)) {
                const regExp = new RegExp(searchText, "ig");

                data.item.Page = data.item.Page.replace(
                    regExp,
                    "<mark class='highlight'>$&</mark>"
                );
            }

            // The page title of a match is always displayed, the section title and section content are not. We need to filter them.
            data.item.Sections = data.item.Sections.filter(section => {
                let flag = false;

                // If section content is matched, we also need to display section title.
                if (section.Content.toLowerCase().includes(searchText)) {
                    const matchSnippetObject = getMatchSnippet(section.Content, searchText);

                    if (matchSnippetObject) {
                        const { isToLeftEnd, isToRightEnd, snippet } = matchSnippetObject;
                        const regExp = new RegExp(searchText, "ig");

                        const highlightContent = snippet.replace(
                            regExp,
                            "<mark class='highlight'>$&</mark>"
                        );

                        if (isToLeftEnd && isToRightEnd) {
                            section.Content = highlightContent;
                        } else if (!isToLeftEnd && isToRightEnd) {
                            section.Content = `...${highlightContent}`;
                        } else if (isToLeftEnd && !isToRightEnd) {
                            section.Content = `${highlightContent}...`;
                        } else {
                            section.Content = `...${highlightContent}...`;
                        }
                    }

                    flag = true;
                } else {
                    // The section content is not matched. Ignore it.
                    section.Content = "";
                }

                // If the match is at section title, we need to highlight it.
                if (section.Title.toLowerCase().includes(searchText)) {
                    const regExp = new RegExp(searchText, "ig");

                    section.Title = section.Title.replace(
                        regExp,
                        "<mark class='highlight'>$&</mark>"
                    );

                    flag = true;
                }

                return flag;
            });
        } else {
            // fuzzy match
            data.matches?.forEach(match => {
                if (match.indices.length !== 0) {
                    switch (match.key) {
                        case 'Page': {
                            // the string needs to be highlighted
                            let str = match.value!;

                            if (str.toLowerCase().includes(searchText)) {
                                // Although it is a fuzzy match, it also has exact match content
                                const regExp = new RegExp(searchText, "ig");

                                str = str.replace(
                                    regExp,
                                    "<mark class='highlight'>$&</mark>"
                                );
                            } else {
                                const indexArr = getLongestThreeMatches(searchText, str, match.indices);

                                indexArr.forEach(obj => {
                                    if (obj) {
                                        const newIndex = str.indexOf(obj.match, obj.index[0] - 1);

                                        if (newIndex > -1 && isNewIndexValid(newIndex, obj.index[0])) {
                                            str = markMatchByIndex(str, newIndex, newIndex + obj.length - 1);
                                        }
                                    }
                                });
                            }

                            // override the data source
                            data.item.Page = str;

                            break;
                        }

                        case 'Sections.Title': {
                            // the string needs to be highlighted
                            let str = match.value!;

                            if (str.toLowerCase().includes(searchText)) {
                                const regExp = new RegExp(searchText, "ig");

                                str = str.replace(
                                    regExp,
                                    "<mark class='highlight'>$&</mark>"
                                );
                            } else {
                                const indexArr = getLongestThreeMatches(searchText, str, match.indices);

                                indexArr.forEach(obj => {
                                    if (obj) {
                                        const newIndex = str.indexOf(obj.match, obj.index[0] - 1);

                                        if (newIndex > -1 && isNewIndexValid(newIndex, obj.index[0])) {
                                            str = markMatchByIndex(str, newIndex, newIndex + obj.length - 1);
                                        }
                                    }
                                });
                            }

                            // override the data source
                            data.item.Sections[match.refIndex!].Title = str;
                            data.item.Sections[match.refIndex!].displayTitle = true;

                            break;
                        }

                        case 'Sections.Content': {
                            let str = match.value!;
                            let contentWithEllipsis = '';

                            if (str.toLowerCase().includes(searchText)) {
                                const matchSnippetObject = getMatchSnippet(str, searchText);

                                if (matchSnippetObject) {
                                    const { isToLeftEnd, isToRightEnd, snippet } = matchSnippetObject;
                                    const regExp = new RegExp(searchText, "ig");

                                    const highlightContent = snippet.replace(
                                        regExp,
                                        "<mark class='highlight'>$&</mark>"
                                    );

                                    if (isToLeftEnd && isToRightEnd) {
                                        contentWithEllipsis = highlightContent;
                                    } else if (!isToLeftEnd && isToRightEnd) {
                                        contentWithEllipsis = `...${highlightContent}`;
                                    } else if (isToLeftEnd && !isToRightEnd) {
                                        contentWithEllipsis = `${highlightContent}...`;
                                    } else {
                                        contentWithEllipsis = `...${highlightContent}...`;
                                    }
                                }

                                data.item.Sections[match.refIndex!].exactMatch = true;
                            } else {
                                const indexArr = getLongestThreeMatches(searchText, str, match.indices);

                                indexArr.forEach(obj => {
                                    if (obj) {
                                        const newIndex = str.indexOf(obj.match, obj.index[0] - 1);

                                        if (newIndex > -1 && isNewIndexValid(newIndex, obj.index[0])) {
                                            str = markMatchByIndex(str, newIndex, newIndex + obj.length - 1);
                                        }
                                    }
                                });

                                const longestMatchObj = indexArr[0];

                                if (longestMatchObj) {
                                    const matchSnippetObject = getMatchSnippet(
                                        str,
                                        longestMatchObj.match,
                                        longestMatchObj.index[0] - 1
                                    );

                                    if (matchSnippetObject) {
                                        let { isToLeftEnd, isToRightEnd, snippet } = matchSnippetObject;

                                        if (isToLeftEnd && isToRightEnd) {
                                            contentWithEllipsis = snippet;
                                        } else if (!isToLeftEnd && isToRightEnd) {
                                            contentWithEllipsis = `...${snippet}`;
                                        } else if (isToLeftEnd && !isToRightEnd) {
                                            contentWithEllipsis = `${snippet}...`;
                                        } else {
                                            contentWithEllipsis = `...${snippet}...`;
                                        }
                                    }
                                }
                            }

                            // override the data source
                            data.item.Sections[match.refIndex!].Content = contentWithEllipsis;
                            data.item.Sections[match.refIndex!].displayTitle = true;
                            data.item.Sections[match.refIndex!].displayContent = true;

                            break;
                        }

                        default:
                            console.error(`No matched key: '${match.key}'`);
                    }
                }
            });

            data.item.Sections.sort((a, b) => {
                if (a.exactMatch && !b.exactMatch) {
                    return -1
                } else if (!a.exactMatch && b.exactMatch) {
                    return 1
                } else {
                    return 0;
                }
            });

            data.item.Sections = data.item.Sections.filter(section => {
                if (!section.displayTitle) {
                    return false;
                }

                if (!section.displayContent) {
                    section.Content = '';
                }

                return true;
            });
        }

        return data.item;
    });

    return filteredRes;
};

function getMatchSnippet(
    string: string,
    term: string,
    position = 0,
    numOfWords = 6
): {
    isToLeftEnd: boolean
    isToRightEnd: boolean
    snippet: string
} | undefined {
    const index = string.toLowerCase().indexOf(term.toLowerCase(), position);

    if (index >= 0) {
        const _ws = [" ", "\t", "\n"]; // Whitespace
        const _pm = [".", "?", "!"]; // Punctuation marks

        let whitespace = 0;

        let left = 0;
        let isToLeftEnd = false;

        let right = 0;
        let isToRightEnd = false;

        // right trim index
        for (right = index + term.length; whitespace < numOfWords; right++) {
            if (right >= string.length || _pm.indexOf(string[right]) >= 0) {
                isToRightEnd = true;
                break;
            }

            if (_ws.indexOf(string[right]) >= 0) {
                whitespace += 1;
            }
        }

        // reset the counter of whitespace
        whitespace = 0;

        // left trim index
        for (left = index; whitespace < numOfWords; left--) {
            if (left < 0 || _pm.indexOf(string[left]) >= 0) {
                isToLeftEnd = true;
                break;
            }

            if (_ws.indexOf(string[left]) >= 0) {
                whitespace += 1;
            }
        }

        // To avoid the case below, we need to include all the highlight element nearby.
        // "Angular's <mark class='highlight'>animation</mark> system is built on <mark ..."
        const markTagPositionArray: PositionObject[] = [];

        const markPrefixStr = `<mark class='highlight'>`;
        let markTagStart, markTagEnd = -1;

        // store the position of highlight mark
        do {
            markTagStart = string.toLowerCase().indexOf(markPrefixStr, markTagEnd !== -1 ? markTagEnd : position);

            if (markTagStart !== -1) {
                markTagEnd = markTagStart + markPrefixStr.length - 1;
                markTagPositionArray.push({ start: markTagStart, end: markTagEnd });
            }
        } while (markTagStart !== -1);

        let newNumOfWords = numOfWords;

        markTagPositionArray.forEach(pos => {
            if (pos.start < left && pos.end > left) {
                newNumOfWords += 1;

                // reset the counter of whitespace
                whitespace = 0;

                // left trim index
                for (left = index; whitespace < newNumOfWords; left--) {
                    if (left < 0 || _pm.indexOf(string[left]) >= 0) {
                        isToLeftEnd = true;
                        break;
                    }

                    if (_ws.indexOf(string[left]) >= 0) {
                        whitespace += 1;
                    }
                }
            }

            if (pos.start < right && pos.end > right) {
                newNumOfWords += 1;

                // reset the counter of whitespace
                whitespace = 0;

                // right trim index
                for (right = index + term.length; whitespace < newNumOfWords; right++) {
                    if (right >= string.length || _pm.indexOf(string[right]) >= 0) {
                        isToRightEnd = true;
                        break;
                    }

                    if (_ws.indexOf(string[right]) >= 0) {
                        whitespace += 1;
                    }
                }
            }
        });

        let offsetLeft = 0;
        let offsetRight = 0;

        if (isToLeftEnd && isToRightEnd) {
            offsetLeft = 1;
            offsetRight = 1;
        } else if (!isToLeftEnd && isToRightEnd) {
            offsetLeft = 1;
            offsetRight = 1;
        } else if (isToLeftEnd && !isToRightEnd) {
            offsetLeft = 1;
            offsetRight = 0;
        } else {
            offsetLeft = 1;
            offsetRight = 0;
        }

        return {
            isToLeftEnd,
            isToRightEnd,
            // return match
            snippet: string.slice(left + offsetLeft, right + offsetRight)
        };
    }

    return; // return nothing
}

function getLongestThreeMatches(query: string, src: string, matchIndices: readonly RangeTuple[]) {
    let words = [];

    //To find the match of longest query word manually
    if (/[_-]+|\s+/.test(query)) {
        words = query.split(/[_-]+|\s+/);
        words.filter(item => item).sort((a, b) => a.length < b.length ? 1 : -1);
    }

    let arr = matchIndices.map(item => {
        const [start, end] = item;

        return {
            match: src.slice(start, end + 1),
            index: item,
            length: end - start + 1
        };
    });

    arr = arr.filter(item => item).sort((a, b) => a.length < b.length ? 1 : -1);

    // When fuzzy search is triggered, it should have one word at least
    const minMatchNumber = Math.max(1, words.length);

    return arr.slice(0, Math.min(minMatchNumber, 3) * 2);
}

function markMatchByIndex(src: string, start: number, end: number): string {
    const textHead = src.slice(0, start);
    const matchStr = src.slice(start, end + 1);
    const textTail = src.slice(end + 1);

    return `${textHead}<mark class='highlight'>${matchStr}</mark>${textTail}`
}

function isNewIndexValid(newIndex: number, oldIndex: number): boolean {
    const mark = `<mark class='highlight'></mark>`;
    const diff = newIndex - oldIndex;

    // Only three matches at most.
    // For the third match, there are two mark inserted at most.
    return diff === 0 ||
        diff === mark.length ||
        diff === mark.length * 2;
}

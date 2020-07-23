import React, {useEffect, useState} from "react";
import { useHistory } from "react-router-dom";
import { Button, Drawer, Input, Tooltip } from "antd";
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Fuse from "fuse.js";
import debounce from "lodash.debounce";

import styles from '@styles/header.module.css'

let data: any[] = [];
let fuse: any;

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
}

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

                    fuse = new Fuse(data, {
                        includeScore: true,
                        useExtendedSearch: true,
                        keys: ["Page", "Sections.Title", "Sections.Content"]
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
                    const res = fuse.search("'" + query); // find the item include query string

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

const searchHighlight = (res: [], queryStr: string) => {
    const filteredRes = JSON.parse(JSON.stringify(res)).map((data: any) => {
        const searchText = queryStr.toLowerCase().trim();

        if (data.item.Page.toLowerCase().includes(searchText)) {
            const regExp = new RegExp(searchText, "ig");

            data.item.Page = data.item.Page.replace(
                regExp,
                "<mark class='highlight'>$&</mark>"
            );
        }

        data.item.Sections = data.item.Sections.filter((section: Section) => {
            let flag = false;

            if (section.Content.toLowerCase().includes(searchText)) {
                const matchSnippetObject = getMatchSnippet(section.Content, searchText);

                if (matchSnippetObject) {
                    const {isToLeftEnd, isToRightEnd, snippet} = matchSnippetObject;
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
                section.Content = "";
            }

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

        return data.item;
    });

    return filteredRes;
};

function getMatchSnippet(string: string, term: string, numOfWords = 6) {
    const index = string.toLowerCase().indexOf(term.toLowerCase());

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

        whitespace = 0; // reset the counter of whitespace
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
            snippet: string.slice(left + offsetLeft, right + offsetRight) // return match
        };
    }

    return; // return nothing
}

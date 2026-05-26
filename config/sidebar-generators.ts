const CHANGELOGS_DOC_ID = 'tutorials/get-started/release-notes/changelogs';

function isReleaseNotesCategory(item) {
    return item.type === 'category' && (
        item.key === 'release-notes' ||
        item.label === 'release-notes' ||
        item.label === 'Release Notes' ||
        item.label === 'リリースノート'
    );
}

function useChangelogsAsReleaseNotesIndex(item, label, changelogsLabel, description) {
    item.label = label;
    item.description = description;
    item.link = {
        type: 'doc',
        id: CHANGELOGS_DOC_ID,
    };
    item.items = item.items.filter(
        (child) => child.key !== 'changelogs' && child.label !== changelogsLabel,
    );
}

function isJapaneseGetStartedCategory(item) {
    return item.label === '始める' || item.label === 'はじめに';
}

export async function tutorialsItemsGenerator({
    defaultSidebarItemsGenerator, ...args
}) {
    var sidebarItems = defaultSidebarItemsGenerator(args)
    sidebarItems = sidebarItems.map(item => {
        if (item.type === 'category') {
            item.collapsible = false;
            item.collapsed = false;
        }

        if (item.label === 'What is Vector Lakebase?') {
            item.collapsible = true;
            item.collapsed = true;
        }

        if (item.label === 'Get Started') {
            item.items = item.items.map(subItem => {
                if (subItem.label === 'API & SDKs') {
                    subItem.items.push(...[
                        {
                            type: 'link',
                            label: 'Python SDK',
                            href: '/reference/python'
                        },
                        {
                            type: 'link',
                            label: 'Java SDK',
                            href: '/reference/java'
                        },
                        {
                            type: 'link',
                            label: 'Go SDK',
                            href: '/reference/go'
                        },
                        {
                            type: 'link',
                            label: 'Node.js SDK',
                            href: '/reference/nodejs'
                        },
                        {
                            type: 'link',
                            label: 'RESTful API',
                            href: '/reference/restful'
                        }
                    ])
                }

                if (isReleaseNotesCategory(subItem)) {
                    useChangelogsAsReleaseNotesIndex(
                        subItem,
                        'Release Notes',
                        'Changelogs',
                        'You can find the history of Zilliz Cloud releases in these docs. | Cloud',
                    )
                }

                return subItem;
            })
        }

        if (isJapaneseGetStartedCategory(item)) {
            item.items = item.items.map(subItem => {
                if (subItem.label === 'APIとSDK') {
                    subItem.items.push(...[
                        {
                            type: 'link',
                            label: 'Python SDK',
                            href: '/ja-JP/reference/python'
                        },
                        {
                            type: 'link',
                            label: 'Java SDK',
                            href: '/ja-JP/reference/java'
                        },
                        {
                            type: 'link',
                            label: 'Go SDK',
                            href: '/ja-JP/reference/go'
                        },
                        {
                            type: 'link',
                            label: 'Node.js SDK',
                            href: '/ja-JP/reference/nodejs'
                        },
                        {
                            type: 'link',
                            label: 'RESTful API',
                            href: '/ja-JP/reference/restful'
                        }
                    ])
                }

                if (isReleaseNotesCategory(subItem)) {
                    useChangelogsAsReleaseNotesIndex(
                        subItem,
                        'リリースノート',
                        '変更履歴',
                        'これらのドキュメントで Zilliz Cloud のリリース履歴を確認できます。| Cloud',
                    )
                }

                return subItem;
            })
        }

        if (item.label === 'Security') {
            item.items = item.items.map(subItem => {
                if (subItem.label === 'Access Control') {
                subItem.items.splice(1, 0, ...[
                    {
                        type: 'link',
                        label: 'Manage Organization Roles',
                        description: "Manage organization roles and permissions.",
                        href: '/docs/organization-users#invite-a-user-to-your-organization'
                    },
                    {
                        type: 'link',
                        label: 'Manage Project Roles',
                        description: "Manage project roles and permissions.",
                        href: '/docs/project-users#invite-a-user-to-a-project'
                    },
                ])

                }

                return subItem;
            })
        }

        if (item.label === 'セキュリティ') {
            item.items = item.items.map(subItem => {
                if (subItem.label === 'アクセス制御') {
                subItem.items.splice(1, 0, ...[
                    {
                        type: 'link',
                        label: '組織の役割',
                        href: '/ja-JP/docs/organization-users#invite-a-user-to-your-organization'
                    },
                    {
                        type: 'link',
                        label: 'プロジェクトの役割',
                        href: '/ja-JP/docs/project-users#invite-a-user-to-a-project'
                    },
                ])

                }

                return subItem;
            })
        }

        return item;
    })

    return sidebarItems;
}

function flattenControlDataPlane(items) {
  return items.flatMap((item) => {
    if (item.type === 'category') {
      const flattenedChildren = flattenControlDataPlane(item.items);
      const label = (item.label || '').toLowerCase();
      if (label.includes('control plane') || label.includes('data plane')) {
        return flattenedChildren;
      }
      return [{ ...item, items: flattenedChildren }];
    }
    return [item];
  });
}

export async function ReferenceItemsGenerator ({
    defaultSidebarItemsGenerator, ...args
}) {
    var sidebarItems = defaultSidebarItemsGenerator(args)
    var iterate = (items) => {
        return items.map(item => {
            if (item.type === 'category') {
                item.collapsed = false;
                item.items = iterate(item.items)
            }

            return item
        })
    }

    sidebarItems = sidebarItems.map(item => {
        // restful
        if (item.label === 'RESTful API Reference') {
            item.collapsed = false;

            item.items = item.items.map(subItem => {
            if (subItem.label === 'V2') {
                subItem.collapsed = false;

                subItem.items = iterate(subItem.items)
                subItem.items = flattenControlDataPlane(subItem.items)
            }

            if (subItem.label === 'V1') {
                subItem.collapsed = true;

                subItem.items = iterate(subItem.items)
                subItem.items = flattenControlDataPlane(subItem.items)
            }

            return subItem
            })
        }

        // python
        if (item.label === 'Python SDK Reference') {
            item.collapsed = false;

            item.items = item.items.map(subItem => {
                if (subItem.label === 'MilvusClient') {
                    subItem.collapsed = false;

                    subItem.items = subItem.items.map(subSubItem => {
                        if (subSubItem.label === 'CollectionSchema') {
                            subSubItem.key = 'collection-schema-milvusclient';
                        }

                        return subSubItem;
                    })
                }

                if (subItem.label === 'ORM') {
                    subItem.className = 'to-be-deprecated'

                    subItem.items = subItem.items.map(subSubItem => {
                        if (subSubItem.label === 'CollectionSchema') {
                            subSubItem.key = 'collection-schema-orm';
                        }

                        return subSubItem;
                    })
                }

                return subItem;
            })
        }

        // java
        if (item.label === 'Java SDK Reference') {
            item.collapsed = false;

            item.items = item.items.map(subItem => {
            if (subItem.label === 'Java SDK Reference (v1)') {
                subItem.label = 'V1';
                subItem.className = 'to-be-deprecated';

                subItem.items = subItem.items.map(subSubItem => {
                    if (subSubItem.label === 'Authentication') {
                        subSubItem.key = 'authentication-java-v1';
                    }

                    return subSubItem;
                })
            }

            if (subItem.label === 'Java SDK Reference (v2)') {
                subItem.label = 'V2';
                subItem.collapsed = false;

                subItem.items = subItem.items.map(subSubItem => {
                    if (subSubItem.label === 'Authentication') {
                        subSubItem.key = 'authentication-java-v2';
                    }

                    return subSubItem;
                })
            }

            return subItem;
            })
        }

        // go
        if (item.label === 'Go SDK Reference') {
            item.collapsed = false;

            item.items = item.items.map(subItem => {
            if (subItem.label === 'Go SDK Reference (v1)') {
                subItem.label = 'V1';
                subItem.className = 'to-be-deprecated';

                subItem.items = subItem.items.map(subSubItem => {
                    if (subSubItem.label === 'Collection') {
                        subSubItem.key = 'collection-go-v1';
                    }

                    if (subSubItem.label === 'Partition') {
                        subSubItem.key = 'partition-go-v1';
                    }

                    return subSubItem;
                })
            }

            if (subItem.label === 'Go SDK Reference (v2)') {
                subItem.label = 'V2';
                subItem.collapsed = false;

                subItem.items = subItem.items.map(subSubItem => {
                    if (subSubItem.label === 'Collection') {
                        subSubItem.key = 'collection-go-v2';
                    }

                    if (subSubItem.label === 'Partition') {
                        subSubItem.key = 'partition-go-v2';
                    }

                    return subSubItem;
                })
            }

            return subItem;
            }) 
        }

        // cli
        if (item.label === 'cli') {
            item.label = 'Zilliz CLI Reference'
            item.collapsed = false;

            item.items = item.items.map(subItem => {
                if (subItem.type === 'category') {
                    subItem.collapsed = false;
                    subItem.items = iterate(subItem.items)
                }

                return subItem                
            })
        }

        return item;
    })

    return sidebarItems;
}

export async function AgentsItemsGenerator ({
    defaultSidebarItemsGenerator, ...args
}) {
    var sidebarItems = defaultSidebarItemsGenerator(args)

    sidebarItems = sidebarItems.map(item => {
        if (item.type === 'category') {
            item.collapsed = false;
        }

        return item;
    })

    return sidebarItems;
}

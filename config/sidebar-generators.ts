export async function tutorialsItemsGenerator({
    defaultSidebarItemsGenerator, ...args
}) {
    var sidebarItems = defaultSidebarItemsGenerator(args)
    sidebarItems = sidebarItems.map(item => {
        if (item.type === 'category') {
            item.collapsible = false;
            item.collapsed = false;
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

                return subItem;
            })
        }

        if (item.label === '開始方法') {
            item.items = item.items.map(subItem => {
                if (subItem.label === 'API & SDK') {
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

                if (subItem.label === 'ベストプラクティス') {
                    subItem.key = 'best-practices-get-started'
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
                        href: '/docs/organization-users#organization-roles'
                    },
                    {
                        type: 'link',
                        label: 'Manage Project Roles',
                        description: "Manage project roles and permissions.",
                        href: '/docs/project-users#project-roles'
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
                        href: '/ja-JP/docs/organization-users#organization-roles'
                    },
                    {
                        type: 'link',
                        label: 'プロジェクトの役割',
                        href: '/ja-JP/docs/project-users#project-roles'
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

        return item;
    })

    return sidebarItems;
}
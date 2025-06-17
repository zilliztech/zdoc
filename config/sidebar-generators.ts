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

        if (item.label === '始める') {
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
                        href: '/docs/organization-users#organization-roles'
                    },
                    {
                        type: 'link',
                        label: 'Manage Project Roles',
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

                subItem.items = iterate(subItem.items)
            }

            if (subItem.label === 'ORM') {
                subItem.className = 'to-be-deprecated'
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
            }

            if (subItem.label === 'Java SDK Reference (v2)') {
                subItem.label = 'V2';
                subItem.collapsed = false;

                subItem.items = iterate(subItem.items)
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
            }

            if (subItem.label === 'Go SDK Reference (v2)') {
                subItem.label = 'V2';
                subItem.collapsed = false;

                subItem.items = iterate(subItem.items)
            }

            return subItem;
            }) 
        }

        return item;
    })

    return sidebarItems;
}
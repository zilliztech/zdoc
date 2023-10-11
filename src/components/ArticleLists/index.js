import React from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';

const Rows = [
    {
        group: 0,
        title: "从这里开始",
        description: "在 5 分钟内掌握基础集群操作 API。",
        Svg: require('@site/static/img/quick-start.svg').default,
        members: [
            {
                title: "快速开始",
                link: "/docs/quick-start-1",
                width: "10em"
            },
            {
                title: "注册帐号",
                link: "/docs/register-with-zilliz-cloud",
                width: "10em"
            },
            {
                title: "免费试用",
                link: "/docs/free-trials",
                width: "10em"
            },
            {
                title: "安装 SDK",
                link: "/docs/install-sdks",
                width: "10em"
            },
            {
                title: "示例数据集",
                link: "/docs/example-dataset-1",
                width: "10em"
            },
        ]
    },
    {
        group: 0,
        title: "快速入门",
        description: "详细了解 Zilliz Cloud 的基础集群操作 API。",
        Svg: require('@site/static/img/starter-user-guides.svg').default,
        members: [
            {
                title: "集群与 Collection",
                link: "",
                width: "100%"
            },
            {
                title: "创建集群",
                link: "/docs/create-cluster",
                width: "10em"
            },
            {
                title: "连接集群",
                link: "/docs/connect-to-cluster",
                width: "10em"
            },
            {
                title: "创建 Collection",
                link: "/docs/create-collection-2",
                width: "10em"
            },
            {
                title: "删除 Collection",
                link: "/docs/drop-collection-1",
                width: "10em"
            },
            {
                title: "管理集群",
                link: "/docs/manage-cluster",
                width: "10em"
            },
            {
                title: "操作数据",
                link: "",
                width: "100%"
            },
            {
                title: "插入 Entity",
                link: "/docs/insert-entities",
                width: "10em"
            },
            {
                title: "向量搜索与查询",
                link: "/docs/search-and-query",
                width: "10em"
            },
            {
                title: "删除 Entity",
                link: "/docs/delete-entities",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
        ]
    },
    {
        group: 0,
        title: "了解向量数据库",
        description: "了解 Zilliz Vector Database 的基础概念。",
        Svg: require('@site/static/img/concepts.svg').default,
        members: [
            {
                title: "集群、Collection 及 Entity",
                link: "/docs/cluster-collection-entities",
                width: "15em"
            },
            {
                title: "ANN 搜索",
                link: "/docs/ann-search-explained",
                width: "10em"
            },
            {
                title: "CU 类型",
                link: "/docs/cu-types-explained-1",
                width: "10em"
            },
            {
                title: "AUTOINDEX",
                link: "/docs/autoindex-explained",
                width: "10em"
            },

            {
                title: "数据模型",
                link: "/docs/data-models-explained",
                width: "10em"
            },
            {
                title: "数据安全",
                link: "/docs/data-security",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
        ]
    },
    {
        group: 0,
        title: "资源规划指南",
        description: "了解 Zilliz Cloud 的资源规划原则及工具。",
        Svg: require('@site/static/img/resource-planning.svg').default,
        members: [
            {
                title: "选择合适的CU类型",
                link: "/docs/choose-the-right-cu-type-and-size",
                width: "10em"
            },
            {
                title: "Zilliz Cloud 版本类型",
                link: "/docs/select-zilliz-cloud-service-plans",
                width: "10em"
            },
            {
                title: "价格计算器",
                link: "/docs/pricing-calculator",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
        ]
    },
    {
        group: 0,
        title: "高级用户指南",
        description: "了解 Zilliz Cloud 的高级集群操作 API。",
        Svg: require('@site/static/img/advanced-user-guides-dark.svg').default,
        members: [
            {
                title: "使用 Schema",
                link: "",
                width: "100%"
            },
            {
                title: "定制 Schema",
                link: "/docs/use-customized-schema",
                width: "10em"
            },
            {
                title: "开启动态 Schema",
                link: "/docs/enable-dynamic-schema",
                width: "10em"
            },
            {
                title: "使用 Partition Key",
                link: "/docs/use-partition-key",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "高级数据类型",
                link: "",
                width: "100%"
            },
            {
                title: "JSON",
                link: "/docs/javascript-object-notation-json-1",
                width: "30%"
            },
            {
                title: "连接与访问控制",
                link: "",
                width: "100%"
            },
            {
                title: "管理 API 密钥",
                link: "/docs/manage-api-keys",
                width: "10em"
            },
            {
                title: "管理身份凭证",
                link: "/docs/manage-cluster-credentials",
                width: "10em"
            },
            {
                title: "管理 MFA",
                link: "/docs/manage-mfa",
                width: "10em"
            },
            {
                title: "设置白名单",
                link: "/docs/set-up-whitelist",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "30%"
            },
            {
                title: "备份与恢复",
                link: "",
                width: "100%"
            },
            {
                title: "创建备份快照",
                link: "/docs/create-snapshot",
                width: "10em"
            },
            {
                title: "创建自动备份",
                link: "/docs/schedule-automatic-backups",
                width: "10em"
            },
            {
                title: "查看备份快照",
                link: "/docs/view-snapshot-details",
                width: "10em"
            },
            {
                title: "恢复备份",
                link: "/docs/restore-from-snapshot",
                width: "10em"
            },
            {
                title: "删除备份快照",
                link: "/docs/delete-snapshot",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "用户和角色",
                link: "",
                width: "100%"
            },
            {
                title: "组织与项目",
                link: "/docs/organizations-projects",
                width: "10em"
            },
            {
                title: "角色与权限",
                link: "/docs/roles-privileges",
                width: "10em"
            },
            {
                title: "添加组织成员",
                link: "/docs/add-organization-members",
                width: "10em"
            },
            {
                title: "移除组织成员",
                link: "/docs/remove-members",
                width: "10em"
            },
            {
                title: "添加项目成员",
                link: "/docs/add-project-collaborators-2",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "监控与指标",
                link: "",
                width: "100%"
            },
            {
                title: "CU 资源监控",
                link: "/docs/cu-resource-monitor",
                width: "10em"
            },
            {
                title: "QPS 资源监控",
                link: "/docs/qps-resource-monitor",
                width: "10em"
            },
            {
                title: "查询时延监控",
                link: "/docs/query-latency-monitor",
                width: "10em"
            },
            {
                title: "已使用容量监控",
                link: "/docs/load-capacity-resource-monitor",
                width: "10em"    
            },
            {
                title: "查看集群性能指标",
                link: "/docs/view-cluster-metrics",
                width: "10em"
            },
            {
                title: "现金余额监控",
                link: "/docs/advance-pay-balance-monitor",
                width: "10em"
            },
            {
                title: "支付方式与帐单",
                link: "",
                width: "100%"
            },
            {
                title: "查看帐单与支付方式",
                link: "/docs/view-invoice-and-payment-method",
                width: "10em"
            },
            {
                title: "订阅阿里云市场",
                link: "/docs/subscribe-on-aliyun-marketplace",
                width: "10em"
            },
            {
                title: "现金充值",
                link: "/docs/advance-pay",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "25em"
            },            
            {
                title: "系统设置",
                link: "",
                width: "100%"
            },
            {
                title: "设置时区",
                link: "/docs/manage-timezone",
                width: "10em"
            },
            {
                title: "设置运维窗口",
                link: "/docs/set-up-maintenance-window",
                width: "10em"
            },
            {
                title: "设置组织信息",
                link: "/docs/manage-organization-information",
                width: "10em"
            },
            {
                title: "企业认证",
                link: "/docs/enterprise-validation",
                width: "15em"
            },
            {
                title: "",
                link: "#",
                width: "8em"
            },
        ]
    },
    {
        group: 0,
        title: "深度阅读",
        description: "深入了解 Zilliz Cloud 的原理及实现。",
        Svg: require('@site/static/img/vector-database-101.svg').default,
        members: [
            {
                title: "什么是非结构化数据",
                link: "/docs/introduction-to-unstructured-data",
                width: "10em"
            },
            {
                title: "什么是向量数据库",
                link: "/docs/what-is-a-vector-database",
                width: "10em"
            },
            {
                title: "什么是向量相似性搜索",
                link: "/docs/introduction-to-vector-similarity-search",
                width: "10em"
            },
            {
                title: "向量索引概览与 IVF 索引",
                link: "/docs/vector-index-basics-and-the-inverted-file-index",
                width: "10em"
            },
            {
                title: "标量量化与乘积量化",
                link: "/docs/scalar-quantization-and-product-quantization",
                width: "10em"
            },
            {
                title: "HNSW",
                link: "/docs/hierarchical-navigable-small-world-hnsw",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "10em"
            },
            {
                title: "",
                link: "#",
                width: "20%"
            },
        ]
    },
    {
        group: 1,
        title: "公开服务",
        description: "了解可以和 Zilliz Cloud 集成的公开服务。",
        Svg: require('@site/static/img/open-services.svg').default,
        members: [
            {
                title: "与 OpenAI 集成搭建相似性搜索系统",
                link: "/docs/similarity-search-with-zilliz-cloud-and-openai",
                width: "16em"
            },
            {
                title: "与 Cohere 集成搭建智能问答系统",
                link: "/docs/question-answering-using-zilliz-cloud-and-cohere",
                width: "16em"
            },
            {
                title: "与 HuggingFace 集成搭建问答系统",
                link: "/docs/question-answering-using-zilliz-cloud-and-hugging-face",
                width: "16em"
            }
        ],
    },
    {
        group: 1,
        title: "开源项目",
        description: "了解可以和 Zilliz Cloud 集成的开源项目。",
        Svg: require('@site/static/img/open-source-projects.svg').default,
        members: [
            {
                title: "与 LangChain 集成搭建智能文档问答系统",
                link: "/docs/question-answering-over-documents-with-zilliz-cloud-and-langchain",
                width: "16em"
            },
            {
                title: "与 LlamaIndex 集成搭建文档问答系统",
                link: "/docs/documentation-qa-using-zilliz-cloud-and-llamaindex",
                width: "16em"
            },
            {
                title: "与 PyTorch 集成搭建图片搜索系统",
                link: "/docs/image-search-with-zilliz-cloud-and-pytorch",
                width: "16em"
            },
            {
                title: "与 SentenceTransformers 集成搭建电影搜索系统",
                link: "/docs/movie-search-using-zilliz-cloud-and-sentencetransformers",
                width: "16em"
            }
        ]
    },
    {
        group:2,
        title: "迁移操作指南",
        description: "了解如何从社区版迁移到 Zilliz Cloud。",
        Svg: require('@site/static/img/migration-guides.svg').default,
        members: [
            {
                title: "从 Milvus 1.x 迁移至 Zilliz Cloud",
                link: "/docs/migrate-from-milvus-1x",
                width: "15em"
            },
            {
                title: "从 Milvus 2.x 迁移至 Zilliz Cloud",
                link: "/docs/migrate-from-milvus-2x",
                width: "15em"
            },
            {
                title: "从 ElasticSearch 迁移至 Zilliz Cloud",
                link: "/docs/migrate-from-elasticsearch",
                width: "15em"
            },
            {
                title: "Zilliz Cloud 集群间迁移",
                link: "/docs/migrate-between-clusters",
                width: "15em"
            },
        ],
    },
    {
        group: 2,
        title: "导入数据至现有 Collection",
        description: "了解如何将数据导入至现有 Collection。",
        Svg: require('@site/static/img/data-import-into-existing-collection.svg').default,
        members: [
            {
                title: "通过 Web 控制台导入",
                link: "/docs/import-data-on-web-ui",
                width: "10em"
            },
            {
                title: "通过 RESTful API 导入",
                link: "/docs/import-data-via-restful-api",
                width: "10em"
            },
            {
                title: "通过 SDK 导入",
                link: "/docs/import-data-via-sdks",
                width: "10em"
            },
        ],
    },
    {
        group: 2,
        title: "参考手册",
        description: "了解更多关于迁移和数据导入的知识。",
        Svg: require('@site/static/img/zilliz-cloud-vs-milvus.svg').default,
        members: [
            {
                title: "使用 BulkWriter 准备导入数据",
                link: "/docs/use-bulkwriter-for-data-import",
                width: "15em"
            },
            {
                title: "API异同",
                link: "/docs/api-comparisons",
                width: "15em"
            },
            {
                title: "其它异同",
                link: "/docs/other-differences",
                width: "15em"
            },
        ],
    }

];

function Column({title, link, width, idx}) {

    const [hover, setHover] = React.useState(false)

    const handleMouseEnter = () => {
      setHover(true)
    }
  
    const handleMouseLeave = () => {
      setHover(false)
    }

    const boxContainer = {
        display: "block", 
        linkHeight: "32px", 
        flex: width, 
        margin: "5px 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    }

    const linkStyle = {
        color: hover ? "#3670F2" : "#000000", 
        textDecoration: "none", 
        fontSize: "0.95em"
    }

    if (width == "100%" && link == "") {
        const BookMarkIcon = require('@site/static/img/1F4D1.svg').default;
        return (
            <div style={boxContainer}>
                <div style={{display: "flex", alignItems: "center", gap: "0.5em", marginTop: idx > 0 ? "40px" : "inherit" }}>
                    <BookMarkIcon style={{ width: "24px", height: "24px"}} />
                    <span style={{fontSize: "0.95em", fontWeight: "bold"}}>{title}</span>
                </div>
                <hr style={{border: "0.5px solid #E0E3E7", margin: "0.5em 0"}} />
            </div>
        );
    }    

    if (link == "#") {
        return (
            <div style={boxContainer}>
                <span style={{fontSize: "1em", fontWeight: "bold"}}></span>
            </div>
        );
    }

    return (
        <div style={boxContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <span>
                <Link style={linkStyle} to={link}>{title}</Link>
            </span>
        </div>
    );
}

function Row({Svg, group, title, description, members}) {
    return (
        <div style={{display: "flex", flexDirection: "row", gap: "2%"}} >
            <div style={{display: "block", flex: "18%"}}>
                <div style={{display: "flex", flexDirection: "row", gap: "0.5em"}}>
                    <div style={{alignSelf: "center"}}>
                        <Svg style={{width: "30px", height: "30px"}} role="img" />
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <span style={{fontSize: "1.2em", fontWeight: "bold"}}>{title}</span>
                        <span style={{fontSize: "0.8em"}}>{description}</span>
                    </div>
                </div>
            </div>
            <div style={{display: "block", flex: "75%"}}>
                <div
                    style={{backgroundColor: "#F6F8FA", border: "1px solid #E0E3E7", borderRadius: "8px", padding: "1.5em 3em"}}>
                    <div style={{display: "flex", flexFlow: "row wrap", gap: "2%"}}>
                        {members.map((member, idx) => (
                            <Column {...member} idx={idx} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ArticlesList() {
    const { pages } = usePluginData('landing-page')
    console.log(pages)

    return (
        <section style={{display: "inline-grid", height: "50px", width: "100%", gridTemplateColumns: "15% auto 10%"}}>
            <div></div>
            <div style={{display: "flex", flexDirection: "column", rowGap: "3em", marginTop: "3em"}}>
                {Rows.map((props, idx) => (
                    <Row key={idx} {...props} />
                ))}
            </div>
            <div></div>
        </section>
    );
}
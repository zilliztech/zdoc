'use strict'

module.exports = [
  {
    "type": "category",
    "label": "工具",
    "key": "category:tutorials/tools",
    "items": [
      {
        "type": "category",
        "label": "智能体与提示词",
        "key": "category:tutorials/tools/agents-and-prompts",
        "link": {
          "type": "doc",
          "id": "tutorials/tools/agents-and-prompts/agents-and-prompts"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-skill",
            "label": "Zilliz Skill",
            "key": "doc:tutorials/tools/agents-and-prompts/zilliz-skill"
          },
          {
            "type": "category",
            "label": "Claude Code 插件",
            "key": "category:tutorials/tools/agents-and-prompts/zilliz-plugin",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-setup",
                "label": "安装与配置",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-setup"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-capabilities",
                "label": "核心能力",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-capabilities"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-examples",
                "label": "更多示例",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-examples"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-gemini-extension",
            "label": "Gemini CLI 扩展",
            "key": "doc:tutorials/tools/agents-and-prompts/zilliz-gemini-extension"
          },
          {
            "type": "category",
            "label": "AI 提示词",
            "key": "category:tutorials/tools/agents-and-prompts/zilliz-ai-prompts",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-ai-prompts"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-base-prompts",
                "label": "基础提示词",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-base-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-resource-planning-prompts",
                "label": "资源规划",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-resource-planning-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-pricing-prompts",
                "label": "定价",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-pricing-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-cluster-connection-prompts",
                "label": "集群连接",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-cluster-connection-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-schema-design-prompts",
                "label": "Schema 设计",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-schema-design-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-search-prompts",
                "label": "搜索",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-search-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-import-prompts",
                "label": "导入",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-import-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-migration-prompts",
                "label": "迁移",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-migration-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-access-control-prompts",
                "label": "访问控制",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-access-control-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-integrations-prompts",
                "label": "集成",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-integrations-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/on-demand-search",
                "label": "按需搜索",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/on-demand-search"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/backfill-and-schema-iteration",
                "label": "回填与 Schema 迭代",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/backfill-and-schema-iteration"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/indexes",
                "label": "索引",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/indexes"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/agent-plugins-and-extensions",
                "label": "智能体插件与扩展",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/agent-plugins-and-extensions"
              }
            ]
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/tools/terraform-provider",
        "label": "Terraform Provider",
        "key": "doc:tutorials/tools/terraform-provider"
      },
      {
        "type": "link",
        "href": "/reference/cli/cli/overview",
        "label": "Zilliz CLI",
        "key": "link:tutorials/tools/zilliz-cli"
      }
    ]
  }
]

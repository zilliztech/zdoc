---
title: "快速开始：安装 CLI 与 Agent 集成 | Cloud"
slug: /cli-and-agent-integration-guide
sidebar_key: cli-and-agent-integration-guide
sidebar_label: "快速开始：安装 CLI 与 Agent 集成"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本指南将帮助你在本地设置 Zilliz CLI 和 Agent 集成。设置完成后，你可以通过自然语言让 Agent 操作 Zilliz Cloud，也可以直接在终端、脚本和 CI 工作流中使用 CLI。 | Cloud"
type: origin
token: WTHSwHKU0iriJtkhWC2cVHM2nud
sidebar_position: 0
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 快速开始

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# 快速开始：安装 CLI 与 Agent 集成

本指南将帮助你在本地设置 Zilliz CLI 和 Agent 集成。设置完成后，你可以通过自然语言让 Agent 操作 Zilliz Cloud，也可以直接在终端、脚本和 CI 工作流中使用 CLI。

## 安装\{#installation}

 开始之前，请确保你已准备好：

- [Zilliz Cloud 账号](http://cloud.zilliz.com.cn)。

- Claude Code，如果您想使用 [Claude Code Plugin](/docs/agents/zilliz-plugin).

- Node.js，如果您想安装 [Zilliz Skill](https://github.com/zilliztech/zilliz-skill).

### 安装 Claude Code 插件\{#install-claude-code-plugin}

如果您想直接在 Claude Code 中操作 Zilliz Cloud，请使用[Claude Code Plugin](/docs/agents/zilliz-plugin) 。

<Procedures>

1. 运行 Claude Code

    ```bash
    > claude
    ```

1. 打开 Plugin Marketplace

    ```bash
    /plugin
    ```

1. 搜索并安装 Zilliz Plugin

    前往 **Discover** 页签并搜索 zilliz。选择 zilliz plugin 并安装。

    ![HiRrbywpvo7mN7xFIjecc4A1nzf](/img/HiRrbywpvo7mN7xFIjecc4A1nzf.png "HiRrbywpvo7mN7xFIjecc4A1nzf")

1. 运行 quickstart wizard。并根据指导安装 CLI 、进行身份验证、连接集群。

    ```plaintext
    /zilliz:quickstart
    ```

</Procedures>

### 为常用 Agent 框架安装 Zilliz Skill\{#install-zilliz-skill-for-common-agent-frameworks}

如果您的 Agent（例如 Codex、Gemini CLI、Cursor 或其他 Agent）支持 Agent Skills，可以按如下方式安装 [Zilliz Skill](https://github.com/zilliztech/zilliz-skill)：

```bash
npx skills add zilliztech/zilliz-skill
```

该命令会提示你选择目标 Agent 框架和安装范围。

### 安装 Zilliz CLI\{#install-zilliz-cli}

[Zilliz CLI](/reference/cli/overview) 是 Plugin 和 Skill 使用的基础命令行工具。

<Procedures>

1. 安装 Zilliz CLI.

    <Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>

    <TabItem value="linux">

    ```bash
    curl -fsSL https://zilliz.com/cli/install.sh | bash
    ```

    </TabItem>

    <TabItem value="windows">

    ```bash
    irm https://zilliz.com/cli/install.ps1 | iex
    ```

    </TabItem>

    </Tabs>

    验证是否安装成功：

    ```bash
    zilliz --version
    ```

1. 身份认证。

    使用您的 Zilliz Cloud 账号进行身份认证：

    ```bash
    zilliz login
    ```

    该命令会打开浏览器完成认证。登录后，您的身份认证凭据会存储在本地。

</Procedures>

## 何时使用 CLI、Plugin 或 Skill\{#when-to-use-cli-plugin-or-skill}

在以下场景中使用这些工具：

- 从本地环境进行手动开发和测试。

- 编写自动化运维脚本，以支持可重复执行的工作流。

- 让您的 Agent 自动调用 Vector Database 或 Vector Lakebase 服务。

### 工具对比\{#tool-comparison}

Claude Code Plugin、Zilliz Skill 和 Zilliz CLI 的能力一致。请根据您工作流选择合适的工具，而不是基于支持的能力范围选择。

<table>
   <tr>
     <th></th>
     <th><p><strong>Claude Code Plugin</strong></p></th>
     <th><p><strong>Zilliz Skill</strong></p></th>
     <th><p><strong>Zilliz CLI</strong></p></th>
   </tr>
   <tr>
     <td><p>适合场景</p></td>
     <td><p>Claude Code 自然语言工作流</p></td>
     <td><p>兼容 Skill 的 Agent</p></td>
     <td><p>终端、脚本和 CI</p></td>
   </tr>
   <tr>
     <td><p><strong>设置方式</strong></p></td>
     <td><p><code>/zilliz:quickstart</code></p></td>
     <td><p><code>npx skills add zilliztech/zilliz-skill</code></p></td>
     <td><p>Install script + <code>zilliz login</code></p></td>
   </tr>
   <tr>
     <td><p><strong>自然语言</strong></p></td>
     <td><p>支持</p></td>
     <td><p>支持</p></td>
     <td><p>不支持</p></td>
   </tr>
   <tr>
     <td><p><strong>自动化</strong></p></td>
     <td><p>Agent 辅助</p></td>
     <td><p>Agent 辅助</p></td>
     <td><p>脚本优先</p></td>
   </tr>
   <tr>
     <td><p><strong>结构化输出</strong></p></td>
     <td><p>Agent 可读响应</p></td>
     <td><p>Agent 可读响应</p></td>
     <td><p>使用 <code>--output json</code> 供脚本解析</p></td>
   </tr>
</table>

### 支持的能力\{#supported-capabilities}

下表说明 CLI、Plugin 和 Skill 支持的能力。

<table>
   <tr>
     <th><p>能力领域</p></th>
     <th><p>可执行操作</p></th>
   </tr>
   <tr>
     <td><p>集群</p></td>
     <td><p>创建、删除、挂起、恢复运行、修改</p></td>
   </tr>
   <tr>
     <td><p>Collection</p></td>
     <td><p>使用自定义 schema 创建、加载、释放、重命名、删除</p></td>
   </tr>
   <tr>
     <td><p>向量</p></td>
     <td><p>Search、Query、Insert,、Upsert、Delete、Hybrid Search</p></td>
   </tr>
   <tr>
     <td><p>Index</p></td>
     <td><p>创建 AUTOINDEX、列出、查看详情、删除</p></td>
   </tr>
   <tr>
     <td><p>Database</p></td>
     <td><p>创建、列出、查看详情、删除</p></td>
   </tr>
   <tr>
     <td><p>用户和角色</p></td>
     <td><p>RBAC 设置、权限管理</p></td>
   </tr>
   <tr>
     <td><p>备份</p></td>
     <td><p>创建、恢复、导出、策略管理</p></td>
   </tr>
   <tr>
     <td><p>导入</p></td>
     <td><p>从阿里云 OSS、Amazon S3 批量导入数据</p></td>
   </tr>
   <tr>
     <td><p>Partition</p></td>
     <td><p>创建、加载、释放、管理</p></td>
   </tr>
   <tr>
     <td><p>监控</p></td>
     <td><p>集群状态、Collection 统计信息、加载状态</p></td>
   </tr>
   <tr>
     <td><p>项目</p></td>
     <td><p>项目和云地域管理</p></td>
   </tr>
   <tr>
     <td><p>账单</p></td>
     <td><p>用量查询、发票查询</p></td>
   </tr>
</table>

## 可以让 Agent 做什么\{#what-you-can-ask-your agent-to-do}

安装完成后，直接描述您的任务。Agent 应将您的请求转换为对应的 Zilliz CLI 命令。以下示例展示了自然语言请求如何映射到 Agent 预期执行的 CLI 命令。

- **列出我的集群，并显示当前正在使用哪个集群。**

    预期 CLI 命令：

    ```bash
    zilliz cluster list
    zilliz context current
    ```

- **为商品向量创建一个 Collection，向量字段维度为 768。**

    预期 CLI 命令：

    ```bash
    zilliz collection create --name product_embeddings --dimension 768
    ```

- **将 S3 中的数据导入到我的 Collection，并检查导入任务状态。**

    预期 CLI 命令：

    ```bash
    zilliz import start --cluster-id <cluster-id> --collection product_embeddings --body '{"files": [["s3://bucket/path/data.json"]]}'
    ```

- **为生产环境中的集群创建备份。**

    预期 CLI 命令：

    ```bash
    zilliz backup create --cluster-id <cluster-id>
    ```

- **使用元数据 Filter 搜索我的 Collection，并返回 top 10 结果。**

    预期 CLI 命令：

    ```bash
    zilliz vector search --collection product_embeddings --data '[[0.1, 0.2, 0.3]]' --filter 'age > 20' --limit 10 --output-fields '["name", "age"]'
    ```

- **创建一个对 analytics collection 具有只读权限的角色。**

    预期 CLI 命令：

    ```bash
    zilliz role create --role analytics_readonly
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Search
    zilliz role grant-privilege --role analytics_readonly --object-type Collection --object-name analytics --privilege Query
    ```


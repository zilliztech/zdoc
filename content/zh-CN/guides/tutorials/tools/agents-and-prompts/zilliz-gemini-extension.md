---
title: "Zilliz Gemini CLI 扩展 | Cloud"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI 扩展"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "适用于 Gemini CLI 的 Zilliz Cloud 扩展是一个自然语言界面，可将 Zilliz Cloud 操作直接带入你的 IDE。你无需记忆 CLI 命令或切换到 Web 控制台，只需用自然语言描述你的需求，插件就会帮你处理。 | Cloud"
type: origin
token: FDwgwyDbMi98nckzPxkc2qWynW4
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Gemini CLI 扩展

适用于 Gemini CLI 的 Zilliz Cloud 扩展是一个自然语言界面，可将 Zilliz Cloud 操作直接带入你的 IDE。你无需记忆 CLI 命令或切换到 Web 控制台，只需用自然语言描述你的需求，插件就会帮你处理。

## 功能说明\{#what-it-does}

- 将自然语言请求转换为 `zilliz-cli` 命令

- 覆盖所有主要的 Zilliz Cloud 操作：集群、数据库、集合、分区、索引、向量、导入、备份、用户/角色、监控、项目和计费

- 在调用时嵌入实时 `--help` 输出，因此助手始终拥有最新的参数信息

- 在执行任何破坏性操作之前都需要用户明确确认

## 前提条件\{#prerequisites}

- 你已安装 Gemini CLI。

## 设置步骤\{#setup-procedure}

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

或者，你也可以先将[此仓库](https://github.com/zilliztech/gemini-cli-extension.git)克隆到本地，然后运行以下命令：

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## 初始设置\{#initial-setup}

安装完成后，运行快速入门向导：

```bash
/zilliz:setup
```

该向导将引导你完成以下步骤：

<Procedures>

1. 安装 Zilliz CLI。

    该插件需要 Zilliz CLI。如果尚未安装，请运行：

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

    验证安装：

    ```bash
    zilliz --version
    ```

1. 进行身份验证。

    使用你的 Zilliz Cloud 账户进行身份验证：

    ```bash
    zilliz auth login
    ```

    这会打开浏览器进行身份验证。登录后，你的凭据将存储在本地。

1. 连接到你的集群。

    配置默认集群连接：

    ```bash
    zilliz context set --cluster-id <your-cluster-id>
    ```

    或者让插件帮助你从可用集群中进行选择。

</Procedures>

## 验证\{#verification}

使用一个简单命令测试插件：

```plaintext
You: "List my clusters"
```

插件应显示你的 Zilliz Cloud 集群。

## 故障排查\{#troubleshooting}

- **插件显示 "CLI not found"**

    **解决方案**：安装 Zilliz CLI：

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

- **身份验证失败**

    **解决方案**：

    1. 检查你的网络连接

    1. 确认你的 Zilliz Cloud 账户处于激活状态

    1. 尝试先退出再重新登录：

    ```bash
    zilliz logout
    zilliz login
    ```

1. **“未配置集群”**

    **解决方案**：设置默认集群：

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 下一步\{#next-step}

Zilliz Claude Code Plugin 和 Zilliz Gemini CLI 扩展底层都共享 Zilliz CLI。你可以阅读 [Zilliz Claude Code Plugin 功能](./zilliz-plugin-capabilities) 和 [Zilliz Claude Code Plugin 示例](./zilliz-plugin-examples) 来了解如何编写提示词。

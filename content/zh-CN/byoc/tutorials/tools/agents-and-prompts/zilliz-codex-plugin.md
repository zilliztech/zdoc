---
title: "Codex 插件 | BYOC"
slug: /zilliz-codex-plugin
sidebar_label: "Codex 插件"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Codex Plugin 让 OpenAI Codex 能够通过自然语言操作 Zilliz Cloud。安装后，Codex 可以帮助您安装和使用 Zilliz CLI、登录并认证 Zilliz Cloud、设置当前活跃的集群上下文，并执行常见的云资源和数据操作，例如管理集群、Collection、向量、索引、导入任务、备份、用户、角色，以及查看监控状态。 | BYOC"
type: origin
token: FHenwePlLiVsBJk0iUDcBXinnXc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Codex 插件

Zilliz Codex Plugin 让 OpenAI Codex 能够通过自然语言操作 Zilliz Cloud。安装后，Codex 可以帮助您安装和使用 Zilliz CLI、登录并认证 Zilliz Cloud、设置当前活跃的集群上下文，并执行常见的云资源和数据操作，例如管理集群、Collection、向量、索引、导入任务、备份、用户、角色，以及查看监控状态。

## 前提条件\{#prerequisites}

- 您已安装 OpenAI Codex。

- 您拥有 Zilliz Cloud 账号。

- 您可以在本地 Codex 环境中安装 Codex 插件。

## 设置步骤\{#setup-procedure}

<Procedures>

1. 添加 Marketplace。

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

1. 在 Codex 中打开 `/plugins` 并从 Marketplace 中安装 `zilliz` 插件。

</Procedures>

或者您也可以根据以下方式直接通过[codex-marketplace](https://www.npmjs.com/package/codex-marketplace) 安装。

```plaintext
npx codex-marketplace add zilliztech/zilliz-plugin --plugins
```

## 初始设置\{#initial-setup}

安装完成后，在 Codex 中调用 `quickstart` skill。例如，您可以这样询问 Codex：

```plaintext
设置 Zilliz CLI。
```

设置流程将引导您完成以下步骤：

<Procedures>  

1. 安装 Zilliz CLI。

    该插件依赖 Zilliz CLI。如果尚未安装，请运行：

    <Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>

    <TabItem value="linux">  

    ```plaintext
    curl -fsSL https://zilliz.com/cli/install.sh | bash
    ```

    </TabItem> <TabItem value="windows">  

    ```plaintext
    irm https://zilliz.com/cli/install.ps1 | iex
    ```

    </TabItem> </Tabs>  

    验证安装是否成功：

    ```plaintext
    zilliz --version
    ```

1. 认证。

    使用您的 Zilliz Cloud 账号进行认证：

    ```plaintext
    zilliz login
    ```

    该命令会打开浏览器完成认证。登录后，您的凭据信息将保存在本地。

1. 连接到您的集群。

    配置默认集群连接：

    ```plaintext
    zilliz context set --cluster-id <your-cluster-id>
    ```

    您也可以让插件帮助您从可用集群中选择一个。

</Procedures>  

## 验证\{#verification}

使用一个简单请求测试插件：

```plaintext
列出全部集群。
```

插件应显示您的 Zilliz Cloud 集群。

您也可以让 Codex 检查当前环境：

```plaintext
显示 Zilliz Cloud 状态。
```

## 故障排除\{#troubleshooting}

- **插件未出现在 Codex 中**

    解决方法：确认已成功添加 marketplace：

    ```plaintext
    codex plugin marketplace add zilliztech/zilliz-plugin
    ```

    然后打开 `/plugins` 并安装 `zilliz`。

- **插件显示 “CLI not found”**

    解决方法：安装 Zilliz CLI：

    <Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>

    <TabItem value="linux">  

    ```plaintext
    curl -fsSL https://zilliz.com/cli/install.sh | bash
    ```

    </TabItem> <TabItem value="windows">  

    ```plaintext
    irm https://zilliz.com/cli/install.ps1 | iex
    ```

    </TabItem> </Tabs> 

- **认证失败**

    解决方法：

    1. 检查您的网络连接。

    1. 确认您的 Zilliz Cloud 账号处于可用状态。

    1. 尝试退出登录后重新登录：

    ```plaintext
    zilliz logout
    zilliz login
    ```

- **未配置集群**

    解决方法：设置默认集群：

    ```plaintext
    zilliz context set --cluster-id <cluster-id>
    ```

## 下一步\{#next-step}

Zilliz Codex Plugin、Zilliz Claude Code Plugin 和 Zilliz Gemini CLI Extension 都使用 Zilliz CLI 作为底层执行层。你可以阅读[核心能力](./zilliz-plugin-capabilities)和[更多示例](./zilliz-plugin-examples)来学习如何编写提示词。
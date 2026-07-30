---
title: "Zilliz Claude Code 插件设置 | Cloud"
slug: /zilliz-plugin-setup
sidebar_label: "设置"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南说明如何在 Claude Code 中安装和设置 Zilliz 插件。| Cloud"
type: origin
token: UDxnwONhSidaQikY6NGcRdmOnUh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Zilliz Claude Code 插件设置

本指南说明如何在 Claude Code 中安装和设置 Zilliz 插件。

## 前提条件\{#prerequisites}

- 你已安装 [Claude Code](https://code.claude.com/)。

## 设置流程\{#setup-procedure}

<Procedures>

1. 运行 Claude Code

    ```bash
    > claude
    ```

1. 打开插件市场

    ```bash
    /plugin
    ```

1. 查找并安装 Zilliz 插件

    前往 **Discover** 选项卡并搜索 zilliz。选择 zilliz 插件进行安装。

    ![TqS3b4z7Ho9xcXxHJaIc7HTZn1e](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/tqs3b4z7ho9xcxxhjaic7htzn1e.png "TqS3b4z7Ho9xcXxHJaIc7HTZn1e")

</Procedures>

如果你的环境不支持通过市场发现插件，你仍然可以通过手动添加 Zilliz 插件市场来安装该插件。

<details>

<summary>通过添加 Zilliz Cloud 插件市场进行安装</summary>

1. 运行 Claude Code

    ```bash
    > claude
    ```

1. 添加 Zilliz 插件市场。

    ```bash
    /plugin marketplace add zilliztech/zilliz-plugin
    ```

1. 安装插件

    ```bash
    /plugin install zilliz@zilliztech/zilliz-plugin
    ```

</details>

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

使用一个简单命令测试该插件：

```plaintext
You: "List my clusters"
```

该插件应显示你的 Zilliz Cloud 集群。

## 故障排查\{#troubleshooting}

- **插件显示“CLI not found”**

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

    1. 尝试先退出登录再重新登录：

    ```bash
    zilliz logout
    zilliz login
    ```

1. **“No cluster configured”**

    **解决方案**：设置默认集群：

    ```bash
    zilliz context set --cluster-id <cluster-id>
    ```

## 后续步骤\{#next-steps}

- [功能参考](./zilliz-plugin-capabilities)

- [示例](./zilliz-plugin-examples)


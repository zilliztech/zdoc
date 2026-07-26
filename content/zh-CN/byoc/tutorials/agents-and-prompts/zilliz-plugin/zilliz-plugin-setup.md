---
title: "安装与配置 | BYOC"
slug: /zilliz-plugin-setup
sidebar_label: "安装与配置"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍如何在 Claude Code 中安装和设置 Zilliz Plugin。 | BYOC"
type: origin
token: UpSMwDQRyiGrJPkKcUUcxtA4nvh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 安装与配置

本指南介绍如何在 Claude Code 中安装和设置 Zilliz Plugin。

## 前提条件\{#}

- 你已经安装 [Claude Code](https://code.claude.com/)。

## 设置步骤\{#}

如果你的环境不支持市场发现，你仍然可以通过手动添加 Zilliz 插件市场来安装插件。

1. 运行 Claude Code

    ```bash
    > claude
    ```

1. 添加 Zilliz Plugin 市场。

    ```bash
    /plugin marketplace add zilliztech/zilliz-plugin
    ```

1. 安装插件

    ```bash
    /plugin install zilliz@zilliztech/zilliz-plugin
    ```

## 后续步骤\{#}

- 能力参考

- 示例


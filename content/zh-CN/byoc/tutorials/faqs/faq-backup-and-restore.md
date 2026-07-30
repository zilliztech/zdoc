---
title: "FAQ：备份与恢复 | BYOC"
slug: /faq-backup-and-restore
sidebar_label: "FAQ：备份与恢复"
beta: FALSE
notebook: FALSE
description: "本文列举了在 Zilliz Cloud 使用备份与恢复功能时可能遇到的常见问题及对应解决方法。 | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 7
displayed_sidebar: default

---

# FAQ：备份与恢复

本文列举了在 Zilliz Cloud 使用备份与恢复功能时可能遇到的常见问题及对应解决方法。

## Contents

- [我是否可以免费试用备份和恢复功能？](#is-the-backup-and-restore-feature-available-in-the-free-trial)
- [我能否在恢复集群备份时，选择集群的 Milvus 版本？](#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup)

## FAQs




### 我是否可以免费试用备份和恢复功能？\{#is-the-backup-and-restore-feature-available-in-the-free-trial}

备份和恢复功能不可免费试用。如需使用，请先添加[支付方式](https://docs.zilliz.com.cn/docs/payment-billing)。

### 我能否在恢复集群备份时，选择集群的 Milvus 版本？\{#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup}

- 对于最近 30 天内创建的备份文件，如果原集群的 Milvus GA 版本早于当前可用的最新 GA 版本，您可以选择恢复后的新集群 Milvus 版本。默认情况下，Zilliz Cloud 会将集群恢复到最新 GA Milvus 版本。

- 对于 30 天前创建的备份文件，或已经使用最新 Milvus GA 版本的备份文件，目标 Milvus 版本不可更改。

例如，假设当前可用的最新 Milvus GA 版本为 2.6.x：

- 如果您使用最近 30 天内创建的 2.5.x 集群备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，但您也可以选择恢复到 2.5.x。

- 如果您使用 30 天前创建的 2.5.x 备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

- 如果您使用 2.6.x 备份文件进行恢复，Zilliz Cloud 会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

---
title: "組織のアラートを管理する | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織のアラートを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。組織アラートは、の問題に対応し、プロジェクトアラートは特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、メトリクスとアラートのリファレンスを参照してください。 | Cloud"
type: origin
token: Q0VrwfTIeiSkfxk90cqcuyJpnEb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


# 組織のアラートを管理する

Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。**組織アラート**は、の問題に対応し、**プロジェクトアラート**は特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

このトピックでは、組織のアラートを表示および管理する方法について説明します。

<Admonition type="info" icon="Notes" title="undefined">

<p>この機能は、StandardおよびEnterpriseプランのクラスターでのみ利用できます。詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p>

</Admonition>

## 概要について{#overview}{#overview}

以下は、各組織のアラートのデフォルト設定の概要を示す表です。

アラートが**ON**状態の場合、条件が満たされると指定された受信者に通知が届きます。[アラートを編集](./manage-organization-alerts#edit-organization-alerts)してステータスを変更できます。

**パーミッション**:

- **表示と構成**:組織の所有者のみが使用できます。

- **通知の受信**:所有者によって指定された場合、すべてのOrganizationメンバーが利用できます。

ユーザーの役割の詳細については、[組織のユーザーを管理する](./organization-users)を参照してください。

## 組織のアラートを表示する{#view-organization-alerts}{#view-organization-alerts}

[**Organization Alert**]ページに移動して、請求関連のさまざまな

---
title: "SCIM Provisioning の概要 | BYOC"
slug: /scim-provisioning-overview
sidebar_label: "SCIM Provisioning の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エンタープライズ環境では、Zilliz Cloud にアクセスするユーザーは常に変化します。新規入社、チーム異動、退職などが日常的に発生するためです。自動プロビジョニングがない場合、組織管理者はユーザーの招待、レコード更新、グループ メンバーシップの維持、アクセス権限とチーム構成の整合性確認などを手動で行い、Zilliz Cloud を最新の状態に保つ必要があります。 | BYOC"
type: origin
token: KhJhw2lOBirGhekK8jbcZkb2nVg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# SCIM Provisioning の概要

エンタープライズ環境では、Zilliz Cloud にアクセスするユーザーは常に変化します。新規入社、チーム異動、退職などが日常的に発生するためです。自動プロビジョニングがない場合、組織管理者はユーザーの招待、レコード更新、グループ メンバーシップの維持、アクセス権限とチーム構成の整合性確認などを手動で行い、Zilliz Cloud を最新の状態に保つ必要があります。

シングル サインオン (SSO) を使用すると、ユーザーは ID プロバイダー (IdP) で管理される ID を使って Zilliz Cloud にサインインできます。これにより、Zilliz Cloud 専用のパスワードやサインイン用 ID は不要になります。ただし、認証は ID 管理の一部にすぎません。SSO はサインイン時にユーザーの本人確認を行いますが、Zilliz Cloud 内のユーザー、グループ、グループ メンバーシップを IdP のディレクトリ データと同期する機能はありません。

System for Cross-domain Identity Management (SCIM) Provisioning は、この課題を解決します。SCIM を使用すると、IdP がユーザー、グループ、グループ メンバーシップを Zilliz Cloud にプロビジョニングし、Zilliz Cloud 上で IdP の ID とチーム構成を再現できます。同期されたグループは Access Control のプリンシパルとして利用でき、Zilliz Cloud 管理者はユーザー単位ではなくグループ単位でロールを割り当てられます。

## Zilliz Cloud における SCIM Provisioning\{#about-scim-provisioning-in-zilliz-cloud}

Zilliz Cloud の SCIM Provisioning は、IdP と Zilliz Cloud 組織間の ID 同期ワークフローです。IdP は SCIM クライアントとして機能し、ユーザー、グループ、グループ メンバーシップの信頼できる唯一の情報源となります。Zilliz Cloud は SCIM 2.0 サーバーとして機能し、IdP からのプロビジョニング要求を受け取って、同期された ID を組織内に反映します。

![BVg3wxmA7h6SqrbqOc2cUoiHnac](https://zdoc-images.s3.us-west-2.amazonaws.com/BVg3wxmA7h6SqrbqOc2cUoiHnac.png)

次の図は、IdP で管理されるグループ、SCIM Provisioning、SSO、および Zilliz Cloud Access Control の連携を示しています。

1. IdP 管理者は、Data Eng、Analytics、Finance などのグループをはじめ、ユーザー、グループ、グループ メンバーシップを IdP 上で管理します。

1. SCIM Provisioning により、これらのユーザー、グループ、グループ メンバーシップが IdP から Zilliz Cloud 組織に同期されます。

1. 同期されたグループは、IdP 由来の ID として Zilliz Cloud に表示されます。グループとそのメンバーシップは引き続き IdP で管理されます。

1. ユーザーは引き続き SSO を通じて Zilliz Cloud にサインインします。SSO がサインイン時の認証を担当し、SCIM が ID レコードの同期を担当します。

1. Zilliz Cloud 管理者は、Access Control で同期済みグループにロールを割り当てます。たとえば、Data Eng に Data Operator ロール、Analytics に Data Viewer ロール、Finance に Billing Admin ロールを割り当てるといった運用が可能です。

SCIM が同期するのは ID データ（ユーザー、グループ、グループ メンバーシップ）のみです。Zilliz Cloud のロールや権限の割り当ては行いません。ロールの割り当ては Zilliz Cloud Access Control で管理され、同期されたユーザーやグループに対して組織ロールやプロジェクト ロールを付与できます。なお、サインイン時の認証は引き続き SSO が担当します。

組織で既に IdP を使ってユーザーとチームを一元的に管理しており、Zilliz Cloud も同じ構造に従わせたい場合に SCIM Provisioning を活用できます。このモデルでは、管理者が IdP 上でユーザーとグループのライフサイクルを管理し、IdP が SCIM を通じて変更内容を Zilliz Cloud にプッシュします。

具体的には、以下のようなケースで有効です。

- ユーザーを手動で招待する代わりに、一元管理された IdP からプロビジョニングしたい。

- IdP のグループとグループ メンバーシップを Zilliz Cloud に同期したい。

- 同期されたグループをアクセス制御のプリンシパルとして活用したい。

- ユーザーの退職や異動に伴う手動での後処理を削減したい。

- Zilliz Cloud の ID データを、IT チームが管理するディレクトリ データと常に一致させたい。

## SCIM が IdP から Zilliz Cloud に同期する項目\{#what-scim-syncs-from-your-idp-to-zilliz-cloud}

SCIM Provisioning は、Zilliz Cloud の ID データを IdP と一致させます。同期対象はユーザー、グループ、グループ メンバーシップであり、ユーザー認証や Zilliz Cloud ロールの割り当ては行いません。認証は SSO などのサインイン方式が引き続き担当し、ロールの割り当ては Zilliz Cloud Access Control で管理します。

| 項目 | SCIM が Zilliz Cloud に同期する内容 | 管理場所 |
| --- | --- | --- |
| ユーザー | SCIM は IdP で割り当てられたユーザーを Zilliz Cloud にプロビジョニングし、IdP での変更に応じてユーザー レコードを更新します。 | どのユーザーをプロビジョニングするかは IdP で管理します。 |
| グループ | SCIM はグループレコードを IdP から Zilliz Cloud に同期します。同期されたグループは Zilliz Cloud 上では読み取り専用となります。 | グループ名とグループのライフサイクルは IdP で管理します。 |
| グループ メンバーシップ | SCIM は各同期グループに所属するユーザー情報を同期します。 | グループへのユーザー追加・削除は IdP で行います。 |
| ロールの割り当て | SCIM はロールや権限を同期しません。同期されたユーザーとグループを Access Control のプリンシパルとして利用可能にするだけです。 | 組織ロールおよびプロジェクト ロールの割り当ては Zilliz Cloud Access Control で行います。 |

ネストされたグループはサポートされていません。同期されたグループにはユーザーを含めることができますが、他のグループを含めることはできません。

## サポートされている ID プロバイダー\{#supported-identity-providers}

Zilliz Cloud は、SSO のドキュメントに記載されているものと同じ IdP に対して SCIM Provisioning をサポートしています。

| ID プロバイダー | 設定ガイド |
| --- | --- |
| Okta | Okta で SCIM Provisioning を設定する |
| Google Workspace | Google Workspace で SCIM Provisioning を設定する |
| Microsoft Entra | Microsoft Entra で SCIM Provisioning を設定する |

IdP ごとに設定手順は異なります。SCIM Provisioning を設定する際は、ご利用の IdP に対応したセットアップ ガイドを参照してください。

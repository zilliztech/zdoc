---
title: "SCIM Provisioning の概要 | Cloud"
slug: /scim-provisioning-overview
sidebar_label: "SCIM Provisioning の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "企業環境では、Zilliz Cloud にアクセスすべきユーザーのリストは常に変化します。新しい従業員の入社、チーム間の異動、退職などが発生するためです。自動プロビジョニングがない場合、組織の管理者はユーザーの招待、ユーザーレコードの更新、グループメンバーシップの維持、アクセス割り当てが現在のチーム構成と一致しているかの確認など、手動で Zilliz Cloud をこれらの変更に合わせる必要があります。 | Cloud"
type: origin
token: KhJhw2lOBirGhekK8jbcZkb2nVg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# SCIM Provisioning の概要

企業環境では、Zilliz Cloud にアクセスすべきユーザーのリストは常に変化します。新しい従業員の入社、チーム間の異動、退職などが発生するためです。自動プロビジョニングがない場合、組織の管理者はユーザーの招待、ユーザーレコードの更新、グループメンバーシップの維持、アクセス割り当てが現在のチーム構成と一致しているかの確認など、手動で Zilliz Cloud をこれらの変更に合わせる必要があります。

シングルサインオン（SSO）を使用すると、ユーザーは ID プロバイダー（IdP）で管理される ID を使って Zilliz Cloud にサインインできるため、個別の Zilliz Cloud パスワードやサインイン用 ID は不要になります。ただし、認証は ID 管理の一部に過ぎません。SSO はサインイン時にユーザーの本人確認を行いますが、Zilliz Cloud 内のユーザー、グループ、グループメンバーシップを IdP で管理されるディレクトリデータと同期する機能はありません。

System for Cross-domain Identity Management（SCIM）Provisioning はこの課題を解決します。SCIM を使用すると、IdP がユーザー、グループ、グループメンバーシップを Zilliz Cloud にプロビジョニングし、Zilliz Cloud が IdP で管理される ID とチームを反映できるようになります。同期されたグループは Access Control のプリンシパルとして使用でき、Zilliz Cloud 管理者はユーザーごとにアクセスを管理する代わりに、グループに対してロールを割り当てることができます。

## Zilliz Cloud における SCIM Provisioning について\{#about-scim-provisioning-in-zilliz-cloud}

Zilliz Cloud における SCIM Provisioning は、IdP と Zilliz Cloud 組織間の ID 同期ワークフローです。IdP は SCIM クライアントとして機能し、ユーザー、グループ、グループメンバーシップの信頼できる唯一のソースとなります。Zilliz Cloud は SCIM 2.0 サーバーとして機能し、IdP からプロビジョニングリクエストを受信して、組織内に同期された ID を反映します。

![BVg3wxmA7h6SqrbqOc2cUoiHnac](https://zdoc-images.s3.us-west-2.amazonaws.com/BVg3wxmA7h6SqrbqOc2cUoiHnac.png)

次の図は、IdP で管理されるグループ、SCIM Provisioning、SSO、および Zilliz Cloud Access Control がどのように連携するかを示しています。

1. IdP 管理者は、Data Eng、Analytics、Finance などのグループをはじめ、IdP 内でユーザー、グループ、グループメンバーシップを管理します。

1. SCIM Provisioning は、それらのユーザー、グループ、グループメンバーシップを IdP から Zilliz Cloud 組織に同期します。

1. 同期されたグループは、IdP からの ID として Zilliz Cloud に表示されます。グループとそのメンバーシップは引き続き IdP で管理されます。

1. ユーザーは引き続き SSO を通じて Zilliz Cloud にサインインします。SSO はユーザーのサインイン認証を担当し、SCIM は ID レコードの同期を維持します。

1. Zilliz Cloud 管理者は、Access Control で同期されたグループにロールを割り当てます。たとえば、Data Eng には Data Operator ロール、Analytics には Data Viewer ロール、Finance には Billing Admin ロールを割り当てることができます。

SCIM が同期するのは ID データ（ユーザー、グループ、グループメンバーシップ）のみです。Zilliz Cloud のロールや権限の割り当ては行いません。ロールの割り当ては Zilliz Cloud Access Control で管理され、同期されたユーザーまたはグループに組織ロールやプロジェクトロールを付与できます。SSO は引き続きユーザーのサインイン時の認証を行います。

SCIM Provisioning は、組織がすでに IdP でユーザーとチームを一元的に管理しており、Zilliz Cloud もその構造に従わせたい場合に使用します。このモデルでは、管理者が IdP でユーザーとグループのライフサイクルを管理し、IdP が SCIM を通じてそれらの変更を Zilliz Cloud にプッシュします。

以下のような場合に有効です。

- ユーザーを手動で招待する代わりに、一元管理された IdP からプロビジョニングしたい場合。

- IdP のグループとグループメンバーシップを Zilliz Cloud に同期したい場合。

- 同期されたグループをアクセス制御のプリンシパルとして使用したい場合。

- ユーザーが組織を離れたり別のチームに異動したりした際の手動作業を削減したい場合。

- Zilliz Cloud の ID データを、IT チームが管理するディレクトリデータと一致させたい場合。

## SCIM が IdP から Zilliz Cloud に同期する内容\{#what-scim-syncs-from-your-idp-to-zilliz-cloud}

SCIM Provisioning は、Zilliz Cloud の ID データを IdP と一致した状態に保ちます。ユーザー、グループ、グループメンバーシップを同期しますが、ユーザーの認証や Zilliz Cloud ロールの割り当ては行いません。認証は引き続き SSO などのサインイン方式によって処理されます。ロールの割り当ては Zilliz Cloud Access Control で管理されます。

| 項目 | SCIM が Zilliz Cloud に同期する内容 | 管理場所 |
| --- | --- | --- |
| ユーザー | SCIM は IdP で割り当てられたユーザーを Zilliz Cloud にプロビジョニングし、IdP での変更に基づいてユーザーレコードを更新します。 | どのユーザーをプロビジョニングするかは IdP で管理します。 |
| グループ | SCIM はグループレコードを IdP から Zilliz Cloud に同期します。同期されたグループは Zilliz Cloud では読み取り専用です。 | グループ名とグループのライフサイクルは IdP で管理します。 |
| グループメンバーシップ | SCIM は各同期グループに所属するユーザーを同期します。 | IdP でグループへのユーザーの追加または削除を行います。 |
| ロールの割り当て | SCIM はロールや権限を同期しません。同期されたユーザーとグループを Access Control のプリンシパルとして利用可能にします。 | 組織ロールとプロジェクトロールは Zilliz Cloud Access Control で割り当てます。 |

入れ子になったグループはサポートされていません。同期されたグループにはユーザーを含めることができますが、他のグループを含めることはできません。

## サポートされている ID プロバイダー\{#supported-identity-providers}

Zilliz Cloud は、SSO 用にドキュメント化されているものと同じ IdP に対して SCIM Provisioning をサポートしています。

| ID プロバイダー | 設定ガイド |
| --- | --- |
| Okta | Okta で SCIM Provisioning を設定する |
| Google Workspace | Google Workspace で SCIM Provisioning を設定する |
| Microsoft Entra | Microsoft Entra で SCIM Provisioning を設定する |

各 IdP には固有の設定ワークフローがあります。SCIM Provisioning を設定する準備ができたら、お使いの IdP に対応するセットアップガイドを参照してください。

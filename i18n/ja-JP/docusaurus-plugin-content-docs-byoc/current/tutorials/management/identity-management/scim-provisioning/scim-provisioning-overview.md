---
title: "SCIM Provisioning の概要 | BYOC"
slug: /scim-provisioning-overview
sidebar_label: "SCIM Provisioning の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エンタープライズ環境では、Zilliz Cloud にアクセスする必要があるユーザーのリストは常に変化します。新しい従業員の入社、ユーザーのチーム間の異動、退職などが発生するためです。自動プロビジョニングがない場合、組織管理者は、ユーザーの招待、ユーザーレコードの更新、グループメンバーシップの維持、アクセス権の割り当てが現在のチーム構成と一致していることの確認を手動で行うことで、Zilliz Cloud をこれらの変化に合わせて維持する必要があります。 | BYOC"
type: origin
token: KhJhw2lOBirGhekK8jbcZkb2nVg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# SCIM Provisioning の概要

エンタープライズ環境では、Zilliz Cloud にアクセスする必要があるユーザーのリストは常に変化します。新しい従業員の入社、ユーザーのチーム間の異動、退職などが発生するためです。自動プロビジョニングがない場合、組織管理者は、ユーザーの招待、ユーザーレコードの更新、グループメンバーシップの維持、アクセス権の割り当てが現在のチーム構成と一致していることの確認を手動で行うことで、Zilliz Cloud をこれらの変化に合わせて維持する必要があります。

シングルサインオン（SSO）を使用すると、ユーザーは ID プロバイダー（IdP）で管理されている ID を使用して Zilliz Cloud にサインインできるため、別途 Zilliz Cloud のパスワードや別のサインイン ID を用意する必要はありません。ただし、認証は ID 管理の一部にすぎません。SSO はサインイン時にユーザーが誰であるかを検証しますが、Zilliz Cloud のユーザー、グループ、グループメンバーシップを IdP で管理されているディレクトリデータと同期した状態に保つ機能はありません。

System for Cross-domain Identity Management（SCIM）プロビジョニングが、このギャップを埋めます。SCIM を使用すると、IdP がユーザー、グループ、グループメンバーシップを Zilliz Cloud にプロビジョニングするため、Zilliz Cloud は IdP で管理されている ID とチームを表現できます。同期されたグループは、Access Control でプリンシパルとして使用できます。Access Control では、Zilliz Cloud 管理者がユーザーごとにアクセスを管理するのではなく、グループにロールを割り当てます。

## Zilliz Cloud での SCIM プロビジョニング\{#about-scim-provisioning-in-zilliz-cloud}

Zilliz Cloud での SCIM プロビジョニングは、IdP と Zilliz Cloud 組織間の ID 同期ワークフローです。IdP は SCIM クライアントとして動作し、ユーザー、グループ、グループメンバーシップの信頼できる唯一の情報源となります。Zilliz Cloud は SCIM 2.0 サーバーとして動作し、IdP からプロビジョニングリクエストを受信して、組織内の同期された ID を表現します。

![BVg3wxmA7h6SqrbqOc2cUoiHnac](https://zdoc-images.s3.us-west-2.amazonaws.com/BVg3wxmA7h6SqrbqOc2cUoiHnac.png)

次の図は、IdP で管理されるグループ、SCIM プロビジョニング、SSO、および Zilliz Cloud Access Control が連携する仕組みを示しています。

1. IdP 管理者は、Data Eng、Analytics、Finance などのグループをはじめ、ユーザー、グループ、グループメンバーシップを IdP で管理します。

1. SCIM プロビジョニングは、これらのユーザー、グループ、グループメンバーシップを IdP から Zilliz Cloud 組織に同期します。

1. 同期されたグループは、IdP からの ID として Zilliz Cloud に表示されます。グループとメンバーシップは引き続き IdP で管理されます。

1. ユーザーは引き続き SSO 経由で Zilliz Cloud にサインインします。SSO はユーザーのサインインを認証し、SCIM は ID レコードを同期した状態に保ちます。

1. Zilliz Cloud 管理者は、Access Control で同期されたグループにロールを割り当てます。たとえば、Data Eng には Data Operator ロール、Analytics には Data Viewer ロール、Finance には Billing Admin ロールを割り当てることができます。

SCIM が同期するのは ID データ（ユーザー、グループ、グループメンバーシップ）のみです。Zilliz Cloud のロールや権限の割り当ては行いません。ロールの割り当ては Zilliz Cloud Access Control で管理され、同期されたユーザーまたはグループに組織ロールやプロジェクトロールを付与できます。サインイン時のユーザー認証は引き続き SSO が行います。

組織ですでに IdP でユーザーとチームを一元的に管理しており、Zilliz Cloud をその構造に従わせたい場合は、SCIM プロビジョニングを使用します。このモデルでは、管理者が IdP でユーザーとグループのライフサイクルを管理し、IdP が SCIM 経由でそれらの変更を Zilliz Cloud にプッシュします。

これは次のような場合に役立ちます。

- ユーザーを手動で招待する代わりに、一元管理された IdP からプロビジョニングしたい場合。

- IdP のグループとグループメンバーシップを Zilliz Cloud に同期したい場合。

- 同期されたグループをアクセス制御のプリンシパルとして使用したい場合。

- ユーザーが組織を離れたり別のチームに異動したりする際の手動での後処理を削減したい場合。

- Zilliz Cloud の ID データを、IT チームが管理するディレクトリデータと一致させたい場合。

## SCIM が IdP から Zilliz Cloud に同期する内容\{#what-scim-syncs-from-your-idp-to-zilliz-cloud}

SCIM プロビジョニングは、Zilliz Cloud の ID データを IdP と一致した状態に保ちます。ユーザー、グループ、グループメンバーシップを同期しますが、ユーザーの認証や Zilliz Cloud ロールの割り当ては行いません。認証は引き続き SSO などのサインイン方式が処理します。ロールの割り当ては引き続き Zilliz Cloud Access Control で管理されます。

| 項目 | SCIM が Zilliz Cloud に同期する内容 | 管理場所 |
| --- | --- | --- |
| ユーザー | SCIM は IdP で割り当てられたユーザーを Zilliz Cloud にプロビジョニングし、IdP での変更に基づいてユーザーレコードを更新します。 | どのユーザーをプロビジョニングするかは IdP で管理します。 |
| グループ | SCIM はグループレコードを IdP から Zilliz Cloud に同期します。同期されたグループは Zilliz Cloud では読み取り専用です。 | グループ名とグループのライフサイクルは IdP で管理します。 |
| グループメンバーシップ | SCIM は各同期グループに所属するユーザーを同期します。 | IdP でグループへのユーザーの追加または削除を行います。 |
| ロールの割り当て | SCIM はロールや権限を同期しません。同期されたユーザーとグループを Access Control のプリンシパルとして利用可能にします。 | 組織ロールとプロジェクトロールは Zilliz Cloud Access Control で割り当てます。 |

ネストされたグループはサポートされていません。同期されたグループにはユーザーを含めることはできますが、他のグループを含めることはできません。

## サポートされている ID プロバイダー\{#supported-identity-providers}

Zilliz Cloud は、SSO でドキュメント化されているものと同じ IdP に対して SCIM プロビジョニングをサポートしています。

| ID プロバイダー | 設定ガイド |
| --- | --- |
| Okta | [Okta を使用した SCIM プロビジョニングの設定](./configure-scim-provisioning-with-okta) |
| Microsoft Entra | [Microsoft Entra を使用した SCIM プロビジョニングの構成](./configure-scim-provisioning-with-microsoft-entra) |

IdP ごとに設定ワークフローは異なります。SCIM プロビジョニングを設定する準備ができたら、ご利用の IdP に対応するセットアップガイドを参照してください。

---
title: "SCIM プロビジョニングの概要 | Cloud"
slug: /scim-provisioning-overview
sidebar_label: "SCIM プロビジョニングの概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "企業環境では、Zilliz Cloud にアクセスすべきユーザーのリストは常に変化します。新しい従業員が入社し、ユーザーがチーム間で異動し、退職する人もいます。自動プロビジョニングがない場合、組織の管理者は、ユーザーを招待し、ユーザーレコードを更新し、グループメンバーシップを維持し、アクセス割り当てが現在のチーム構成と引き続き一致していることを確認する作業を手動で行い、Zilliz Cloud をこれらの変更に合わせ続ける必要があります。 | Cloud"
type: origin
token: KhJhw2lOBirGhekK8jbcZkb2nVg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# SCIM プロビジョニングの概要

企業環境では、Zilliz Cloud にアクセスすべきユーザーのリストは常に変化します。新しい従業員が入社し、ユーザーがチーム間で異動し、退職する人もいます。自動プロビジョニングがない場合、組織の管理者は、ユーザーを招待し、ユーザーレコードを更新し、グループメンバーシップを維持し、アクセス割り当てが現在のチーム構成と引き続き一致していることを確認する作業を手動で行い、Zilliz Cloud をこれらの変更に合わせ続ける必要があります。

シングルサインオン（SSO）を使用すると、ユーザーは ID プロバイダー（IdP）で管理されている ID を使用して Zilliz Cloud にサインインできるため、Zilliz Cloud 専用のパスワードや別のサインイン ID は必要ありません。ただし、認証は ID 管理の一部にすぎません。SSO はサインイン時にユーザーが誰であるかを検証しますが、Zilliz Cloud 内のユーザー、グループ、グループメンバーシップを IdP で管理されているディレクトリデータと同期した状態に保つことはありません。

System for Cross-domain Identity Management（SCIM）プロビジョニングは、このギャップを埋めます。SCIM を使用すると、IdP がユーザー、グループ、グループメンバーシップを Zilliz Cloud にプロビジョニングするため、Zilliz Cloud は IdP で管理されている ID とチームを表現できるようになります。同期されたグループは Access Control のプリンシパルとして使用でき、Zilliz Cloud の管理者はユーザーごとにアクセスを管理する代わりに、グループにロールを割り当てます。

## Zilliz Cloud における SCIM プロビジョニングについて\{#about-scim-provisioning-in-zilliz-cloud}

Zilliz Cloud における SCIM プロビジョニングは、IdP と Zilliz Cloud 組織の間で行われる ID 同期ワークフローです。IdP は SCIM クライアントとして動作し、ユーザー、グループ、グループメンバーシップの信頼できる情報源であり続けます。Zilliz Cloud は SCIM 2.0 サーバーとして動作し、IdP からプロビジョニングリクエストを受信して、組織内の同期された ID を表現します。

![BVg3wxmA7h6SqrbqOc2cUoiHnac](https://zdoc-images.s3.us-west-2.amazonaws.com/BVg3wxmA7h6SqrbqOc2cUoiHnac.png)

次の図は、IdP で管理されるグループ、SCIM プロビジョニング、SSO、および Zilliz Cloud Access Control がどのように連携するかを示しています。

1. IdP 管理者は、Data Eng、Analytics、Finance などのグループをはじめ、ユーザー、グループ、グループメンバーシップを IdP で管理します。

1. SCIM プロビジョニングは、それらのユーザー、グループ、グループメンバーシップを IdP から Zilliz Cloud 組織に同期します。

1. 同期されたグループは、IdP からの ID として Zilliz Cloud に表示されます。グループとメンバーシップは引き続き IdP で管理されます。

1. ユーザーは引き続き SSO 経由で Zilliz Cloud にサインインします。SSO はユーザーのサインインを認証し、SCIM は ID レコードを同期した状態に保ちます。

1. Zilliz Cloud の管理者は、Access Control で同期されたグループにロールを割り当てます。たとえば、Data Eng には Data Operator ロール、Analytics には Data Viewer ロール、Finance には Billing Admin ロールを割り当てることができます。

SCIM が同期するのは ID データ（ユーザー、グループ、グループメンバーシップ）のみです。Zilliz Cloud のロールや権限の割り当ては行いません。ロールの割り当ては Zilliz Cloud Access Control で管理され、同期されたユーザーまたはグループに組織ロールやプロジェクトロールを付与できます。SSO は、ユーザーがサインインする際の認証を引き続き行います。

SCIM プロビジョニングは、組織がすでに IdP でユーザーとチームを一元的に管理しており、Zilliz Cloud をその構造に従わせたい場合に使用します。このモデルでは、管理者が IdP でユーザーとグループのライフサイクルを管理し、IdP が SCIM を通じてそれらの変更を Zilliz Cloud にプッシュします。

これは、次のような場合に役立ちます。

- ユーザーを手動で招待する代わりに、一元管理された IdP からプロビジョニングする場合。

- IdP のグループとグループメンバーシップを Zilliz Cloud に同期する場合。

- 同期されたグループをアクセス制御のプリンシパルとして使用する場合。

- ユーザーが組織を離れたり別のチームに異動したりする際の手動によるクリーンアップを削減する場合。

- Zilliz Cloud の ID データを、IT チームが維持するディレクトリデータと一致させ続ける場合。

## SCIM が IdP から Zilliz Cloud に同期する内容\{#what-scim-syncs-from-your-idp-to-zilliz-cloud}

SCIM プロビジョニングは、Zilliz Cloud の ID データを IdP と一致した状態に保ちます。ユーザー、グループ、グループメンバーシップを同期しますが、ユーザーの認証や Zilliz Cloud のロールの割り当ては行いません。認証は引き続き SSO などのサインイン方式によって処理されます。ロールの割り当ては引き続き Zilliz Cloud Access Control で管理されます。

| 項目 | SCIM が Zilliz Cloud に同期する内容 | 管理場所 |
| --- | --- | --- |
| ユーザー | SCIM は、IdP で割り当てられたユーザーを Zilliz Cloud にプロビジョニングし、IdP での変更に基づいてユーザーレコードを更新します。 | どのユーザーをプロビジョニングするかは IdP で管理します。 |
| グループ | SCIM は、IdP のグループレコードを Zilliz Cloud に同期します。同期されたグループは Zilliz Cloud では読み取り専用です。 | グループ名とグループのライフサイクルは IdP で管理します。 |
| グループメンバーシップ | SCIM は、各同期グループにどのユーザーが所属するかを同期します。 | IdP でグループへのユーザーの追加または削除を行います。 |
| ロールの割り当て | SCIM はロールや権限を同期しません。同期されたユーザーとグループを Access Control のプリンシパルとして使用できるようにします。 | 組織ロールとプロジェクトロールは Zilliz Cloud Access Control で割り当てます。 |

入れ子になったグループはサポートされていません。同期されたグループにはユーザーを含めることができますが、他のグループを含めることはできません。

## サポートされている ID プロバイダー\{#supported-identity-providers}

Zilliz Cloud は、SSO 用にドキュメント化されているものと同じ IdP に対して SCIM プロビジョニングをサポートしています。

| ID プロバイダー | 設定ガイド |
| --- | --- |
| Okta | [Okta で SCIM プロビジョニングを設定する](./configure-scim-provisioning-with-okta) |
| Microsoft Entra | [Microsoft Entra で SCIM プロビジョニングを設定する](./configure-scim-provisioning-with-microsoft-entra) |

各 IdP には独自の設定ワークフローがあります。SCIM プロビジョニングを設定する準備ができたら、お使いの IdP のセットアップガイドを使用してください。

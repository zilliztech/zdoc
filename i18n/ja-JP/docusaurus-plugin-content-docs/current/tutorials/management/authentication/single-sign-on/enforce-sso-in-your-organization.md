---
title: "組織で SSO を強制する | Cloud"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織に対して Single Sign-on (SSO) を設定した後も、メンバーは email/password またはサードパーティアカウント（Google、GitHub）でのログインを引き続き選択できます。SSO の強制によりこの柔軟性はなくなり、すべてのメンバーが唯一のログイン方法として SSO を使用することが必須になります。 | Cloud"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

デフォルトでは、組織に対して Single Sign-on (SSO) を設定した後も、メンバーは email/password またはサードパーティアカウント（Google、GitHub）でのログインを引き続き選択できます。SSO の強制によりこの柔軟性はなくなり、すべてのメンバーが唯一のログイン方法として SSO を使用することが必須になります。

この機能は、IdP を通じた認証の一元化、監査制御、アイデンティティガバナンスなど、エンタープライズのセキュリティおよびコンプライアンス要件を満たす必要がある組織向けに設計されています。

## 概要\{#overview}

組織で SSO の強制を有効にすると、次のようになります。

- email/password またはサードパーティアカウント（Google、GitHub）でログインしようとするメンバーはブロックされ、代わりに SSO 経由でログインするよう求められます。

- ユーザーが複数の組織に所属しており、そのうち **いずれか** の組織で SSO の強制が有効になっている場合、そのユーザーは SSO 経由でログインする必要があります。これは、ユーザーがどの組織にアクセスしようとしているかに関係なく適用されます。

- Organization Owner は自動的に適用除外となり、引き続き他の方法でログインできます。詳細は [適用除外ルール](./enforce-sso-in-your-organization#exemption-rules) を参照してください。

- 適用除外されていないメンバーのすべてのアクティブセッションは直ちに無効化されます。影響を受けるメンバーはログアウトされ、SSO 経由で再認証する必要があります。

- 組織メンバーへの直接招待は無効になります。ユーザーは IdP を通じてプロビジョニングする必要があります。プロジェクトレベルの招待は、既存の組織メンバーのみに制限されます。

- 組織で Zilliz Cloud の [MFA](./multi-factor-auth) が有効になっている場合、SSO の強制をオンにすると自動的に無効になります。MFA が必要な場合は、代わりに IdP 内で設定してください。

## 開始前に\{#before-you-start}

SSO の強制を有効にする前に、以下を確認してください。

- あなたが Zilliz Cloud 組織の **Organization Owner** であること。

- 組織に対して SSO 接続が**設定および検証済み**であること。設定手順については、使用している IdP の構成ガイド（例: [Okta (OIDC)](./openid-connect)）を参照してください。

- 対象となるすべてのメンバーが IdP 内の SSO アプリケーションに割り当てられており、SSO 経由で正常にログインできること。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインし、SSO の強制を有効にしたい組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで、**Single Sign-On (SSO)** セクションを見つけます。SSO がすでに設定され、有効になっていることを確認してください。

1. **Enforce SSO Login** トグルを見つけてオンにします。

1. **Confirm** をクリックします。これにより、現在 password を使用しているすべてのメンバーがログアウトされ、直接のメンバー招待が無効になります。

</Procedures>

有効にすると、すべての組織メンバー（**Organization Owner** を除く）は SSO 経由でログインする必要があります。email/password またはサードパーティアカウント（Google、GitHub）でのログインの試行はブロックされます。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud console で **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. 確認をクリックします。

</Procedures>

SSO の強制を無効にすると、メンバーは元の password でログインできるようになります。

## 適用除外ルール\{#exemption-rules}

Organization Owner は自動的に SSO の強制の適用除外となります。これはブレークグラスの仕組みとして機能し、IdP の設定ミスや利用不能時であっても、少なくとも 1 人の管理者が常に組織へアクセスできることを保証します。

適用除外のロジックは次のルールに従います。

- ユーザーが所属する **すべての SSO 強制対象組織で Organization Owner** である場合、そのユーザーは適用除外され、任意の方法でログインできます。

- ユーザーが **一部** の SSO 強制対象組織では Organization Owner であっても、他の **いずれか** の SSO 強制対象組織では通常メンバーである場合、そのユーザーは**適用除外されず**、SSO 経由でログインする必要があります。

次の表は、複数の組織にまたがるユーザーに対する適用除外の挙動を示しています。

| **User** | **Org A (SSO enforced)** | **Org B (SSO enforced)** | **Org C (no enforcement)** | **Exempt?** |
| --- | --- | --- | --- | --- |
| User X | Org Owner | Org Owner | Any role | Yes |
| User Y1 | Org Owner | Org Member | Org Owner | **No** |
| User Y2 | Org Owner | Org Member | Org Member | **No** |
| User Y3 | Org Member | Org Member | Org Owner | **No** |
| User Z | Org Member | Org Member | Org Member | No |

要約すると、ユーザーが適用除外されるのは、SSO の強制が有効になっている **すべて** の組織で Organization Owner ロールを保持している場合のみです。強制されていない組織で Organization Owner であっても、適用除外は付与されません。

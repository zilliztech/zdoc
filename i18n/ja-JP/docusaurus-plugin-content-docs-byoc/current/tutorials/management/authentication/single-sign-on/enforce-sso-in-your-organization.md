---
title: "組織で SSO を強制する | BYOC"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織に Single Sign-on (SSO) を設定した後でも、メンバーはメールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）でログインすることを選択できます。SSO の強制によりこの柔軟性はなくなり、すべてのメンバーに唯一のログイン方法として SSO の使用が義務付けられます。 | BYOC"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

デフォルトでは、組織に Single Sign-on (SSO) を設定した後でも、メンバーはメールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）でログインすることを選択できます。SSO の強制によりこの柔軟性はなくなり、すべてのメンバーに唯一のログイン方法として SSO の使用が義務付けられます。

この機能は、集中認証、監査制御、ID プロバイダー（IdP）を通じた ID ガバナンスなど、エンタープライズのセキュリティおよびコンプライアンス要件を満たす必要がある組織向けに設計されています。

## 概要\{#overview}

組織で SSO の強制を有効にすると、次のようになります。

- メールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）でログインしようとするメンバーはブロックされ、代わりに SSO でログインするよう求められます。

- ユーザーが複数の組織に所属しており、それらの組織の**いずれか**で SSO の強制が有効になっている場合、そのユーザーは SSO でログインする必要があります。これは、ユーザーがどの組織にアクセスしようとしているかに関係なく適用されます。

- Organization Owner は自動的に除外対象となるため、引き続き他の方法でログインできます。詳細は[除外ルール](./enforce-sso-in-your-organization#exemption-rules)を参照してください。

- 除外対象ではないメンバーのすべてのアクティブセッションは直ちに無効化されます。影響を受けるメンバーはログアウトされ、SSO を介して再認証する必要があります。

- 組織メンバーへの直接招待は無効になります。ユーザーは IdP を通じてプロビジョニングしてください。プロジェクトレベルの招待は、既存の組織メンバーのみに制限されます。

- 組織で Zilliz Cloud の [MFA](./multi-factor-auth) が有効になっている場合、SSO の強制をオンにすると自動的に無効になります。MFA が必要な場合は、代わりに IdP 内で設定してください。

## 始める前に\{#before-you-start}

SSO の強制を有効にする前に、以下を確認してください。

- あなたが Zilliz Cloud 組織の **Organization Owner** であること。

- 組織用の SSO 接続が**設定および検証済み**であること。設定手順については、使用している IdP の構成ガイド（例：[Okta (OIDC)](./openid-connect)）を参照してください。

- 対象となるすべてのメンバーが IdP 内の SSO アプリケーションに割り当てられており、SSO で正常にログインできること。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインし、SSO の強制を有効にしたい組織に移動します。

1. 左側のナビゲーションペインで、**Settings** をクリックします。

1. **Settings** ページで、**Single Sign-On (SSO)** セクションを見つけます。SSO がすでに設定され、有効になっていることを確認してください。

1. **Enforce SSO Login** トグルを見つけてオンにします。

1. **Confirm** をクリックします。これにより、現在パスワードを使用しているすべてのメンバーがログアウトされ、直接メンバー招待が無効になります。

</Procedures>

有効にすると、すべての組織メンバー（**Organization Owners** を除く）は SSO でログインする必要があります。メールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）でのログインはブロックされます。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. 確認をクリックします。

</Procedures>

SSO の強制が無効になると、メンバーは元のパスワードでログインできます。

## 除外ルール\{#exemption-rules}

Organization Owners は SSO の強制から自動的に除外されます。これは、IdP の設定ミスや利用不可の場合でも、少なくとも 1 人の管理者が常に組織にアクセスできるようにするための非常時対応メカニズムとして機能します。

除外ロジックは次のルールに従います。

- 所属している**SSO 強制対象のすべての組織で Organization Owner である**ユーザーは除外対象となり、任意の方法でログインできます。

- **一部**の SSO 強制対象組織では Organization Owner であっても、**他のいずれか**の SSO 強制対象組織では通常メンバーであるユーザーは、**除外対象ではなく**、SSO でログインする必要があります。

次の表は、複数の組織にまたがるユーザーの除外動作を示しています。

| **ユーザー** | **組織 A（SSO 強制あり）** | **組織 B（SSO 強制あり）** | **組織 C（強制なし）** | **除外対象?** |
| --- | --- | --- | --- | --- |
| ユーザー X | Org Owner | Org Owner | 任意のロール | はい |
| ユーザー Y1 | Org Owner | Org Member | Org Owner | **いいえ** |
| ユーザー Y2 | Org Owner | Org Member | Org Member | **いいえ** |
| ユーザー Y3 | Org Member | Org Member | Org Owner | **いいえ** |
| ユーザー Z | Org Member | Org Member | Org Member | いいえ |

要約すると、ユーザーが除外対象になるのは、SSO の強制が有効になっている**すべての**組織で Organization Owner ロールを保持している場合に限られます。SSO の強制が有効ではない組織で Organization Owner であっても、除外は適用されません。

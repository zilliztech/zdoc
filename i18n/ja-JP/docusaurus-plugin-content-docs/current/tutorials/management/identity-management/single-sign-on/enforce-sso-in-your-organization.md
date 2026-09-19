---
title: "組織で SSO を強制する | Cloud"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織にシングルサインオン（SSO）を設定した後も、メンバーはメールアドレス/passwordまたはサードパーティアカウント（Google、GitHub）でログインする方法を選択できます。SSO の強制を有効にすると、すべてのメンバーに SSO を唯一のログイン方法として使用することが義務付けられ、この柔軟性は失われます。 | Cloud"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

デフォルトでは、組織にシングルサインオン（SSO）を設定した後も、メンバーはメールアドレス/passwordまたはサードパーティアカウント（Google、GitHub）でログインする方法を選択できます。SSO の強制を有効にすると、すべてのメンバーに SSO を唯一のログイン方法として使用することが義務付けられ、この柔軟性は失われます。

この機能は、ID プロバイダー（IdP）を通じた認証の一元化、監査管理、ID ガバナンスなど、エンタープライズレベルのセキュリティおよびコンプライアンス要件を満たす必要がある組織向けに設計されています。

## 概要\{#overview}

組織で SSO の強制が有効になっている場合、次のように動作します。

- メールアドレス/passwordまたはサードパーティアカウント（Google、GitHub）でログインしようとしたメンバーはブロックされ、代わりに SSO でのログインが求められます。

- ユーザーが複数の組織に所属しており、そのうち**いずれか**の組織で SSO の強制が有効になっている場合、そのユーザーは SSO でログインする必要があります。これは、そのユーザーがアクセスしようとしている組織がどれであるかに関係なく適用されます。

- Organization Owner は自動的に免除され、引き続き他の方法でログインできます。詳細については、[免除ルール](./enforce-sso-in-your-organization#exemption-rules) を参照してください。

- 免除対象外のメンバーのアクティブなセッションはすべて直ちに無効化されます。影響を受けるメンバーはログアウトされ、SSO による再認証が必要です。

- 組織のメンバーへの直接招待は無効になります。ユーザーは IdP を通じてプロビジョニングしてください。プロジェクトレベルの招待は、既存の組織メンバーのみを対象としています。

- 組織で Zilliz Cloud の [MFA](./multi-factor-auth) が有効になっている場合、SSO の強制をオンにすると自動的に無効になります。MFA が必要な場合は、代わりに IdP 内で設定してください。

## 事前準備\{#before-you-start}

SSO の強制を有効にする前に、以下を満たしていることを確認してください。

- Zilliz Cloud 組織の **Organization Owner** であること。

- 組織の SSO 接続が**設定および検証済み**であること。設定手順については、お使いの IdP の構成ガイド（例: [Okta（OIDC）](./openid-connect)）を参照してください。

- 対象となるすべてのメンバーが IdP の SSO アプリケーションに割り当てられており、SSO で正常にログインできること。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO の強制を有効にする組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけます。SSO がすでに設定され、有効になっていることを確認します。

1. **Enforce SSO Login** トグルを見つけてオンにします。

1. **Confirm** をクリックします。これにより、現在パスワードを使用しているすべてのメンバーがログアウトされ、メンバーの直接招待が無効になります。

</Procedures>

有効にすると、**Organization Owner** を除くすべての組織メンバーが SSO でログインする必要があります。メールアドレス/passwordまたはサードパーティアカウント（Google、GitHub）でのログインはブロックされます。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. クリックして確定します。

</Procedures>

SSO の強制を無効にすると、メンバーは元のパスワードでログインできるようになります。

## 免除ルール\{#exemption-rules}

Organization Owner は SSO の強制から自動的に免除されます。これは、IdP の設定が誤っている場合や IdP を利用できない場合でも、少なくとも 1 人の管理者が常に組織にアクセスできるようにするための緊急時アクセス手段として機能します。

免除の判定は、次のルールに従います。

- 所属する**すべての SSO 強制組織で Organization Owner** であるユーザーは免除され、任意の方法でログインできます。

- **一部の** SSO 強制組織で Organization Owner であるものの、**他のいずれかの** SSO 強制組織で一般メンバーであるユーザーは免除**されず**、SSO でログインする必要があります。

次の表は、複数の組織に所属するユーザーの免除の動作を示しています。

| **ユーザー** | **組織 A（SSO 強制）** | **組織 B（SSO 強制）** | **組織 C（強制なし）** | **免除対象？** |
| --- | --- | --- | --- | --- |
| ユーザー X | Org Owner | Org Owner | 任意のロール | はい |
| ユーザー Y1 | Org Owner | Org Member | Org Owner | **いいえ** |
| ユーザー Y2 | Org Owner | Org Member | Org Member | **いいえ** |
| ユーザー Y3 | Org Member | Org Member | Org Owner | **いいえ** |
| ユーザー Z | Org Member | Org Member | Org Member | いいえ |

まとめると、ユーザーが免除されるのは、SSO の強制が有効になっている**すべての**組織で Organization Owner ロールを保持している場合に限られます。強制が有効になっていない組織で Organization Owner であっても、免除の対象にはなりません。

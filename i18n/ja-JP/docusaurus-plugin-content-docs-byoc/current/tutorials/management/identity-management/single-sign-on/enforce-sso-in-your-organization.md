---
title: "組織で SSO を強制する | BYOC"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織にシングルサインオン（SSO）を構成した後も、メンバーはメール/passwordまたはサードパーティーアカウント（Google、GitHub）でログインすることを選択できます。SSO の強制を有効にすると、すべてのメンバーが SSO のみをログイン方法として使用することが必須となり、この柔軟性は失われます。 | BYOC"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

デフォルトでは、組織にシングルサインオン（SSO）を構成した後も、メンバーはメール/passwordまたはサードパーティーアカウント（Google、GitHub）でログインすることを選択できます。SSO の強制を有効にすると、すべてのメンバーが SSO のみをログイン方法として使用することが必須となり、この柔軟性は失われます。

この機能は、ID プロバイダー（IdP）による認証の一元化、監査管理、ID ガバナンスなど、エンタープライズレベルのセキュリティおよびコンプライアンス要件を満たす必要がある組織を対象としています。

## 概要\{#overview}

組織で SSO の強制を有効にすると、次のような動作になります。

- メール/passwordまたはサードパーティーアカウント（Google、GitHub）でログインしようとしたメンバーはブロックされ、代わりに SSO でのログインを求められます。

- ユーザーが複数の組織に所属しており、そのうち**いずれか**の組織で SSO の強制が有効になっている場合、そのユーザーは SSO でログインする必要があります。これは、ユーザーがアクセスしようとしている組織がどれであるかにかかわらず適用されます。

- Organization Owner は自動的に免除され、引き続き他の方法でログインできます。詳細については、[免除ルール](./enforce-sso-in-your-organization#exemption-rules) を参照してください。

- 免除対象外のメンバーのアクティブなセッションはすべて即座に無効になります。影響を受けるメンバーはログアウトされ、SSO で再認証する必要があります。

- 組織への直接のメンバー招待は無効になります。ユーザーは IdP を通じてプロビジョニングしてください。プロジェクトレベルの招待は、既存の組織メンバーのみに制限されます。

- 組織で Zilliz Cloud の [MFA](./multi-factor-auth) が有効になっている場合、SSO の強制をオンにすると MFA は自動的に無効になります。MFA が必要な場合は、代わりに IdP 内で構成してください。

## 事前準備\{#before-you-start}

SSO の強制を有効にする前に、以下を確認してください。

- Zilliz Cloud 組織の **Organization Owner** であること。

- 組織の SSO 接続が**構成および検証済み**であること。設定手順については、お使いの IdP の構成ガイド（例：[Okta (OIDC)](./openid-connect)）を参照してください。

- 対象となるすべてのメンバーが IdP の SSO アプリケーションに割り当てられており、SSO で正常にログインできること。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO の強制を有効にする組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけます。SSO がすでに構成され有効になっていることを確認します。

1. **Enforce SSO Login** トグルを見つけてオンにします。

1. **Confirm** をクリックします。これにより、現在パスワードを使用しているすべてのメンバーがログアウトされ、直接のメンバー招待が無効になります。

</Procedures>

有効にすると、**Organization Owner** を除くすべての組織メンバーは SSO でログインする必要があります。メール/passwordまたはサードパーティーアカウント（Google、GitHub）でのログインはブロックされます。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. クリックして確定します。

</Procedures>

SSO の強制を無効にすると、メンバーは元のパスワードでログインできるようになります。

## 免除ルール\{#exemption-rules}

Organization Owner は SSO の強制から自動的に免除されます。これは、IdP が誤って構成されている場合や利用できない場合でも、少なくとも 1 人の管理者が常に組織にアクセスできるようにするための緊急時アクセス用のメカニズムです。

免除のロジックは次のルールに従います。

- 所属する**すべての SSO の強制が有効な組織で Organization Owner** であるユーザーは免除され、任意の方法でログインできます。

- **一部の** SSO の強制が有効な組織で Organization Owner であっても、**他のいずれか**の SSO の強制が有効な組織で一般メンバーであるユーザーは免除**されず**、SSO でログインする必要があります。

次の表は、複数の組織にわたるユーザーの免除の動作を示しています。

| **ユーザー** | **組織 A（SSO 強制）** | **組織 B（SSO 強制）** | **組織 C（強制なし）** | **免除対象？** |
| --- | --- | --- | --- | --- |
| ユーザー X | Org Owner | Org Owner | 任意のロール | はい |
| ユーザー Y1 | Org Owner | Org Member | Org Owner | **いいえ** |
| ユーザー Y2 | Org Owner | Org Member | Org Member | **いいえ** |
| ユーザー Y3 | Org Member | Org Member | Org Owner | **いいえ** |
| ユーザー Z | Org Member | Org Member | Org Member | いいえ |

まとめると、ユーザーが免除されるのは、SSO の強制が有効になっている**すべての**組織で Organization Owner ロールを保持している場合のみです。強制が有効でない組織で Organization Owner であっても、免除は適用されません。

---
title: "組織で SSO を強制する | Cloud"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織にシングルサインオン (SSO) を設定した後も、メンバーはメール/passwordやサードパーティアカウント (Google、GitHub) でログインできます。SSO の強制を有効にすると、すべてのメンバーに SSO でのログインが義務付けられ、他のログイン方法は使用できなくなります。 | Cloud"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

デフォルトでは、組織にシングルサインオン (SSO) を設定した後も、メンバーはメール/passwordやサードパーティアカウント (Google、GitHub) でログインできます。SSO の強制を有効にすると、すべてのメンバーに SSO でのログインが義務付けられ、他のログイン方法は使用できなくなります。

この機能は、ID プロバイダー (IdP) を通じた認証の一元化、監査管理、ID ガバナンスなど、エンタープライズレベルのセキュリティおよびコンプライアンス要件を満たす必要がある組織向けに設計されています。

## 概要\{#overview}

組織で SSO の強制が有効になっている場合、以下の動作が適用されます。

- メール/passwordやサードパーティアカウント (Google、GitHub) でログインしようとするとブロックされ、SSO でのログインが求められます。

- ユーザーが複数の組織に所属しており、その**いずれか**で SSO の強制が有効になっている場合、アクセス先の組織に関係なく、SSO でのログインが必要です。

- Organization Owner は自動的に免除対象となり、引き続き他の方法でもログインできます。詳細については、[免除ルール](./enforce-sso-in-your-organization#exemption-rules)を参照してください。

- 免除対象外のメンバーのアクティブなセッションはすべて直ちに無効化されます。対象となるメンバーはログアウトされ、SSO による再認証が必要です。

- 組織への直接招待は無効になります。ユーザーのプロビジョニングは IdP を通じて行ってください。プロジェクトレベルの招待は、既存の組織メンバーにのみ送信できます。

- 組織で Zilliz Cloud の [MFA](./multi-factor-auth) が有効になっている場合、SSO の強制をオンにすると自動的に無効になります。MFA が必要な場合は、IdP 側で設定してください。

## 事前確認事項\{#before-you-start}

SSO の強制を有効にする前に、以下の条件を満たしていることを確認してください。

- Zilliz Cloud 組織の **Organization Owner** であること。

- 組織の SSO 接続が**設定および検証済み**であること。設定手順については、お使いの IdP の設定ガイド (例: [Okta (OIDC)](./openid-connect)) を参照してください。

- 対象となるすべてのメンバーが IdP の SSO アプリケーションに割り当てられており、SSO で正常にログインできること。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO の強制を有効にする組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで、SSO がすでに設定され、有効になっていることを確認します。

1. **Enforce SSO Login** トグルをオンにします。

1. **Confirm** をクリックします。これにより、現在パスワードでログインしているすべてのメンバーがログアウトされ、組織への直接招待が無効になります。

</Procedures>

有効化後、**Organization Owner** を除くすべての組織メンバーは SSO でログインする必要があります。メール/passwordやサードパーティアカウント (Google、GitHub) でのログインはブロックされます。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを開きます。

1. **Enforce SSO Login** トグルをオフにします。

1. 確認ダイアログで承認します。

</Procedures>

SSO の強制を無効にすると、メンバーは従来のパスワードでログインできるようになります。

## 免除ルール\{#exemption-rules}

Organization Owner は SSO の強制から自動的に免除されます。これは、IdP の設定ミスや障害時でも、少なくとも 1 人の管理者が組織にアクセスできるようにするための緊急用アクセス手段です。

免除の判定ロジックは以下のルールに従います。

- 所属する**すべての SSO 強制組織で Organization Owner** であるユーザーは免除対象となり、任意の方法でログインできます。

- **一部の** SSO 強制組織では Organization Owner であっても、**他のいずれかの** SSO 強制組織で一般メンバーであるユーザーは免除**されず**、SSO でのログインが必要です。

以下の表は、複数の組織に所属するユーザーの免除判定例を示しています。

| **ユーザー** | **組織 A (SSO 強制)** | **組織 B (SSO 強制)** | **組織 C (強制なし)** | **免除対象?** |
| --- | --- | --- | --- | --- |
| ユーザー X | Org Owner | Org Owner | 任意のロール | はい |
| ユーザー Y1 | Org Owner | Org Member | Org Owner | **いいえ** |
| ユーザー Y2 | Org Owner | Org Member | Org Member | **いいえ** |
| ユーザー Y3 | Org Member | Org Member | Org Owner | **いいえ** |
| ユーザー Z | Org Member | Org Member | Org Member | いいえ |

つまり、ユーザーが免除されるのは、SSO の強制が有効になっている**すべての**組織で Organization Owner ロールを持っている場合に限られます。強制されていない組織で Organization Owner であっても、免除の対象にはなりません。

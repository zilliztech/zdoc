---
title: "API Keys | Cloud"
slug: /manage-api-keys
sidebar_label: "API Keys"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "API key は、Zilliz Cloud の control plane および data plane リソースにアクセスするための API または SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API key は、名前や ID などの独自のプロパティを持つ英数字の文字列です。 | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# API Keys

API key は、Zilliz Cloud の control plane および data plane リソースにアクセスするための API または SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API key は、名前や ID などの独自のプロパティを持つ英数字の文字列です。

## API key の概要\{#overview-of-api-keys}

Zilliz Cloud では、多様なユーザー要件に対応するために 2 種類の API key を提供しています。

- **Personal API keys**: ユーザー登録時に自動生成され、各 key はユーザーのアカウントに紐付けられ、そのユーザーが所属する organization および project におけるロールの権限を継承します。アカウントユーザーが organization を離れると、関連する personal key は自動的に削除されます。[Organization Owner](./organization-users#organization-owner) または [Project Admin](./project-users#project-admin) として、Zilliz Cloud Web コンソールでは次の 2 種類の personal API key を確認できます。

    - **Your own personal API key**: 自分専用の personal key です。この API key は表示およびコピーできます。

    - **Member's personal API key**: organization または project 内の他のユーザーに属する既存の personal key の一覧です。これらの key 自体は表示できず、名前と ID のみ表示できます。

- **Customized API keys**: Zilliz Cloud アカウントを持たないアプリケーションまたは外部ユーザー向けに、**Organization Owners** と **Project Admins** が手動で作成する key です。これらの key は長期的なアクセス要件に最適で、API key の最初の作成者が organization を離れた場合でもサービス継続性を確保できます。

<Admonition type="info" icon="📘" title="Notes">

本番環境では、代わりに customized key を使用してください。Personal API key はユーザーアカウントとともに削除されます。

</Admonition>

以下の図は、API Key のロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

次の表は、割り当てられたロールに基づく API key のアクセス範囲を示しています。ロールと権限の詳細については、[Access Control Explained](./access-control-overview) を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>API Key ロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Owner</p></td>
     <td><p>organization 内のすべてのリソース（project、cluster、volume を含む）に対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Billing Admin</p></td>
     <td><p>organization の請求に対する管理者アクセスのみ。organization 内の project、cluster、volume にはアクセス不可。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Organization Member</p></td>
     <td><p>Project Admin</p></td>
     <td><p>指定された project に対する完全な管理者アクセス。デフォルトで、その project 内のすべての cluster と volume に対しても完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Write</p></td>
     <td><p>指定された project に対する読み取りおよび書き込みアクセス。デフォルトで、その project 内のすべての cluster と volume に対しても読み取りおよび書き込みアクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Only</p></td>
     <td><p>指定された project に対する読み取り専用アクセス。デフォルトで、その project 内のすべての cluster と volume に対しても読み取り専用アクセス。</p></td>
   </tr>
</table>

### 上限と制限\{#limits-and-restrictions}

- 各 organization には、最大 100 個の customized API key を含めることができます。

- API key の管理権限は、organization および project 内でのユーザーのロールの影響を受けます。具体的な権限は次のとおりです。

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>Organization Owner</strong></p></th>
         <th rowspan="2"><p><strong>Organization Billing Admin</strong></p></th>
         <th colspan="3"><p><strong>Organization Member</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Project Admin</strong></p></td>
         <td><p><strong>Project Read-Write</strong></p></td>
         <td><p><strong>Project Read-Only</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>あなた自身の Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>表示とコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>名前と ID の表示</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>コピー</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>メンバーが organization を離れると自動削除</p></td>
         <td><p>メンバーが organization を離れると自動削除</p></td>
         <td><p>メンバーが organization を離れると自動削除</p></td>
         <td><p>メンバーが organization を離れると自動削除</p></td>
         <td><p>メンバーが organization を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>Customized API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>表示とコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## API key を作成する\{#create-an-api-key}

Zilliz Cloud が各 organization ユーザーに対して自動生成する personal key とは別に、customized key を作成できます。customized API key を作成できるのは **Organization Owners** と **Project Admins** のみです。

<Procedures>

1. organization の **API Keys** ページに移動します。**+ API Key** をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **API Key Name** を入力し、**API Key Access** を設定します。

    ![Td6mboU99oiRhVxvbYecZJf1nGC](https://zdoc-images.s3.us-west-2.amazonaws.com/td6mbou99oirhvxvbyeczjf1ngc.png "Td6mboU99oiRhVxvbYecZJf1nGC")

    - **API Key Name:** 名前は 64 文字以内である必要があります。

    - **API Key Description (optional)**: 作成する API key の説明です。最大 255 文字です。

    - **API Key Access**: 適切な organization ロールおよび project ロールを割り当てて、現在の customized API key のアクセス範囲を定義します。よりきめ細かなアクセス制御のために、**Restrict Access to Specific Clusters and Volumes** をチェックして、この key がアクセスできる cluster と volume を制限できます。

        <Admonition type="info" icon="📘" title="📘 Notes">

        [Project Admins](./project-users) の場合、このユーザーが API key に付与できる権限は、そのユーザー自身の権限範囲に制限されます。 

        </Admonition>

</Procedures>

## API key を表示する\{#view-api-keys}

organization の **API Keys** ページに移動します。表示内容は、あなたの[ロール](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **Organization Owner** の場合、自分自身の personal key、すべてのメンバーの personal key、そしてすべての customized key を表示できます。 

- **Project Admin** の場合、自分自身の personal key に加えて、自分の権限範囲内にあるメンバーの personal key と customized key を表示できます。たとえば、*User 1* が *Project A* の Project Admin のみであり、*Key 1* が *Projects A*、*B*、*C* に対する Admin アクセスを持っている場合、*Key 1* のアクセス範囲は *User 1* の権限を超えているため、*User 1* には *Key 1* は表示されません。

- **Organization Billing Admin**、**Project Read-Write**、または **Project Read-Only** の場合、自分自身の personal API key のみ表示できます。

以下のスクリーンショットは、**Organization Owner** から見た API key の表示を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## API key を編集する\{#edit-an-api-key}

現在、編集できるのは customized API key のみです。Personal key はアカウントユーザーに紐付いているため編集できません。personal key のアクセス範囲を変更するには、まずユーザーの organization ロールおよび project ロールを調整する必要があります。ユーザーのロールに対する変更は、key のアクセス権限に自動的に反映されます。

以下の手順では、customized API key を編集する方法を説明します。

<Procedures>

1. organization の **API Keys** ページに移動します。操作列の **...** をクリックし、**Edit** をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. API Key の **API Key Name** と **API Key Access** を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API Key Name:** 名前は 64 文字以内である必要があります。

    - **API Key Access**:  適切な organization ロールおよび project ロールを割り当てて、現在の customized API key のアクセス範囲を定義します。よりきめ細かなアクセス制御のために、**Restrict Access to Specific Clusters and Volumes** をチェックして、この key がアクセスできる cluster と volume を制限できます。

        <Admonition type="info" icon="📘" title="📘 Notes">

        [Project Admins](./project-users) の場合、このユーザーが API key に付与できる権限は、そのユーザー自身の権限範囲に制限されます。 

        </Admonition>

</Procedures>

## API key をリセットする\{#reset-an-api-key}

personal API key または customized API key が漏洩した可能性がある場合は、直ちにリセットする必要があります。 

<Admonition type="info" icon="📘" title="🚧 Warning">

この操作により、現在の API key はリセットされて無効になります。この key を使用しているアプリケーションコードは、新しい key の値で関連コードを更新するまで動作しなくなります。

</Admonition>

key の種類によって、手順は異なります。

- **Personal API key をリセットする**: ロールに関係なく、自分自身の personal API key のみリセットできます。 

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **Customized API key をリセットする**: customized API key をリセットできるのは Organization Owners と Project Admins のみです。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## API key を削除する\{#delete-an-api-key}

customized API key が不要になった場合は、できるだけ早く削除してください。customized API key を削除できるのは **Organization Owners** と **Project Admins** のみです。

personal key は手動で削除できません。ただし、対応するユーザーが organization を離れると、自動的に無効化され削除されます。 

以下のスクリーンショットは、customized API key を削除する方法を示しています。

<Admonition type="info" icon="📘" title="🚧 Warning">

API key を削除すると、その key を使用しているすべてのサービスの Zilliz Cloud リソースへのアクセスは不可逆的に終了します。

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## FAQ\{#faq}

**本番環境で personal API key を使用すべきですか？**  

いいえ。**Personal API keys** は個々のユーザーアカウントに紐付いており、ユーザーが organization を離れると自動的に削除されます。key の所有者のアカウントが削除されると、その key に依存しているアプリケーションやサービスは、Zilliz Cloud リソースへのアクセスを即座に失います。 

本番環境では、代わりに **customized API keys** を使用してください。customized key は特定の個人ユーザーアカウントに依存しないため、チームメンバーが organization を離れた場合でもサービス継続性を確保できます。    


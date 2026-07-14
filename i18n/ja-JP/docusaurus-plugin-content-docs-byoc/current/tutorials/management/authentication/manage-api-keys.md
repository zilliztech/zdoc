---
title: "API キー | BYOC"
slug: /manage-api-keys
sidebar_label: "API キー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "API キーは、Zilliz Cloud の control plane および data plane リソースにアクセスするために API または SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。 | BYOC"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# API キー

API キーは、Zilliz Cloud の control plane および data plane リソースにアクセスするために API または SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。

## API キーの概要\{#overview-of-api-keys}

Zilliz Cloud では、多様なユーザー要件に対応するために 2 種類の API キーを提供しています。

- **Personal API keys**: ユーザー登録時に自動生成され、各キーはユーザーのアカウントに関連付けられ、ユーザーが所属する organization および project におけるユーザーのロールの権限を継承します。アカウントユーザーが organization を離れると、関連する personal キーは自動的に削除されます。[Organization Owner](./organization-users#organization-owner) または [Project Admin](./project-users#project-admin) として、Zilliz Cloud Web コンソールでは次の 2 種類の personal API キーを確認できます。

    - **Your own personal API key**: 自分のみに属する personal キーです。この API キーを表示してコピーできます。

    - **Member's personal API key**: organization または project 内の他のユーザーに属する既存の personal キーの一覧です。これらのキーの名前と ID のみを表示でき、キーそのものは表示できません。

- **Customized API keys**: **Organization Owners** と **Project Admins** が、Zilliz Cloud アカウントを持たないアプリケーションまたは外部ユーザーのために手動で作成するキーです。これらのキーは長期的なアクセス要件に適しており、API キーの初期作成者が organization を離れた場合でもサービス継続性を確保できます。

<Admonition type="info" icon="📘" title="Notes">

本番環境では、代わりに customized キーを使用してください。Personal API keys はユーザーアカウントとともに削除されます。

</Admonition>

次の図は、API Key のロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づく API キーのアクセス範囲を詳しく示しています。ロールと権限の詳細については、[Access Control Explained](./access-control-overview) を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>API Key Role</strong></p></th>
     <th><p><strong>Access Level</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Owner</p></td>
     <td><p>organization 内のすべてのリソース（projects、clusters、volumes を含む）に対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Billing Admin</p></td>
     <td><p>organization の請求に対する管理者アクセスのみ。organization 内の projects、clusters、volumes にはアクセスできません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Organization Member</p></td>
     <td><p>Project Admin</p></td>
     <td><p>指定された projects に対する完全な管理者アクセス、およびデフォルトでその projects 内のすべての clusters と volumes に対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Write</p></td>
     <td><p>指定された projects に対する読み取りおよび書き込みアクセス、およびデフォルトでその projects 内のすべての clusters と volumes に対する読み取りおよび書き込みアクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Only</p></td>
     <td><p>指定された projects に対する読み取り専用アクセス、およびデフォルトでその projects 内のすべての clusters と volumes に対する読み取り専用アクセス。</p></td>
   </tr>
</table>

### 制限事項\{#limits-and-restrictions}

- データ操作を実行するには、代わりに cluster token を使用してください。有効な cluster token は `user:pass` のように、コロンで区切られた cluster のユーザー名とパスワードです。

- 各 organization には、最大 100 個の customized API キーを含めることができます。

- API キーの管理権限は、organization および project におけるユーザーのロールの影響を受けます。具体的な権限は次のとおりです。

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
         <td colspan="6"><p><strong>Your Own Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>Create</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>View and copy</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
         <td><p>ユーザーが organization を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>Members' Personal API Key</strong></p></td>
       </tr>
       <tr>
         <td><p>Create</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>View names and IDs</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Copy</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
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
         <td><p>Create</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>View and copy</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Edit</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Reset</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>Delete</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## API キーを作成する\{#create-an-api-key}

Zilliz Cloud が各 organization ユーザーに対して自動生成する personal キーとは別に、customized キーを作成できます。customized API キーを作成できるのは **Organization Owners** と **Project Admins** のみです。

<Procedures>

1. organization の **API Keys** ページに移動します。**+ API Key** をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **API Key Name** を入力し、**API Key Access** を設定します。

    ![Td6mboU99oiRhVxvbYecZJf1nGC](https://zdoc-images.s3.us-west-2.amazonaws.com/td6mbou99oirhvxvbyeczjf1ngc.png "Td6mboU99oiRhVxvbYecZJf1nGC")

    - **API Key Name:** 名前は 64 文字を超えてはいけません。

    - **API Key Description (optional)**: 作成する API キーの説明です。最大 255 文字です。

    - **API Key Access**: 適切な organization および project ロールを割り当てることで、現在の customized API キーのアクセス範囲を定義します。さらに細かなアクセス制御が必要な場合は、**Restrict Access to Specific Clusters and Volumes** をチェックして、キーがアクセスできる clusters と volumes を制限できます。

        <Admonition type="info" icon="📘" title="📘 Notes">

        [Project Admins](./project-users) の場合、このユーザーが API キーに付与できる権限は、そのユーザー自身の権限範囲に制限されます。 

        </Admonition>

</Procedures>

## API キーを表示する\{#view-api-keys}

organization の **API Keys** ページに移動します。表示内容は、あなたの具体的な [role](./manage-api-keys#limits-and-restrictions) によって異なる場合があります。

- **Organization Owner** としては、自分の personal キー、すべてのメンバーの personal キー、およびすべての customized キーを表示できます。 

- **Project Admin** としては、自分の personal キーに加え、自分の権限範囲内にあるメンバーの personal キーおよび customized キーを表示できます。たとえば、*User 1* が *Project A* のみの Project Admin であり、*Key 1* が *Projects A*、*B*、および *C* に対する Admin アクセスを持つ場合、*Key 1* のアクセス範囲は *User 1* の権限を超えているため、*User 1* には *Key 1* は表示されません。

- **Organization Billing Admin**、**Project Read-Write**、または **Project Read-Only** としては、自分の personal API キーのみを表示できます。

以下のスクリーンショットは、**Organization Owner** の API キー表示画面を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## API キーを編集する\{#edit-an-api-key}

現在、編集できるのは customized API キーのみです。Personal キーはアカウントユーザーに紐付いているため、編集できません。personal キーのアクセス範囲を変更するには、まずユーザーの organization および project ロールを調整する必要があります。ユーザーのロールに対する変更は、キーのアクセス権限に自動的に反映されます。

以下の手順では、customized API キーを編集する方法を説明します。

<Procedures>

1. organization の **API Keys** ページに移動します。操作列の **...** をクリックし、**Edit** をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. API キーの **API Key Name** と **API Key Access** を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API Key Name:** 名前は 64 文字を超えてはいけません。

    - **API Key Access**: 適切な organization および project ロールを割り当てることで、現在の customized API キーのアクセス範囲を定義します。さらに細かなアクセス制御が必要な場合は、**Restrict Access to Specific Clusters and Volumes** をチェックして、キーがアクセスできる clusters と volumes を制限できます。

        <Admonition type="info" icon="📘" title="📘 Notes">

        [Project Admins](./project-users) の場合、このユーザーが API キーに付与できる権限は、そのユーザー自身の権限範囲に制限されます。 

        </Admonition>

</Procedures>

## API キーをリセットする\{#reset-an-api-key}

personal または customized API キーが侵害された可能性がある場合は、直ちにリセットする必要があります。 

<Admonition type="info" icon="📘" title="🚧 Warning">

この操作により、現在の API キーはリセットされ、無効になります。このキーを使用しているアプリケーションコードは、新しいキー値で関連コードを更新するまで動作を停止します。

</Admonition>

キーの種類に応じて、手順は異なります。

- **Reset personal API keys**: ロールに関係なく、自分自身の personal API キーのみリセットできます。 

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **Reset customized API keys**: customized API キーをリセットできるのは Organization Owners と Project Admins のみです。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## API キーを削除する\{#delete-an-api-key}

customized API キーが不要になった場合は、できるだけ早く削除してください。customized API キーを削除できるのは **Organization Owners** と **Project Admins** のみです。

personal キーは手動で削除できません。ただし、対応するユーザーが organization を離れると、自動的に無効化および削除されます。 

以下のスクリーンショットは、customized API キーを削除する方法を示しています。

<Admonition type="info" icon="📘" title="🚧 Warning">

API キーを削除すると、そのキーを使用しているあらゆるサービスの Zilliz Cloud リソースへのアクセスは不可逆的に終了します。

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## FAQ\{#faq}

**本番環境で personal API キーを使用すべきですか？**  

いいえ。**Personal API keys** は個々のユーザーアカウントに紐付いており、ユーザーが organization を離れると自動的に削除されます。キー所有者のアカウントが削除されると、そのキーに依存しているアプリケーションやサービスは直ちに Zilliz Cloud リソースへのアクセスを失います。 

本番環境では、代わりに **customized API keys** を使用してください。customized キーは特定の個人ユーザーアカウントに依存しないため、チームメンバーが organization を離れた場合でもサービス継続性を確保できます。    


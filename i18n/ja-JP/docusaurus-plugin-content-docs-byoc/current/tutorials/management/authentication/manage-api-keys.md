---
title: "API キー | BYOC"
slug: /manage-api-keys
sidebar_label: "API キー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "API キーは、Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API または SDK 呼び出しを行うユーザーまたはアプリケーションの認証に使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。 | BYOC"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# API キー

API キーは、Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API または SDK 呼び出しを行うユーザーまたはアプリケーションの認証に使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。

## API キーの概要\{#overview-of-api-keys}

Zilliz Cloud では、多様なユーザー要件に対応するために 2 種類の API キーを提供しています。

- **Personal API keys**: ユーザー登録時に自動的に生成され、各キーはユーザーのアカウントに関連付けられ、そのユーザーが所属する組織およびプロジェクトにおけるユーザーのロールの権限を継承します。アカウントユーザーが組織を離れた場合、関連付けられた personal キーは自動的に削除されます。[Organization Owner](./manage-platform-roles#predefined-organization-roles) または [Project Admin](./manage-platform-roles#predefined-project-roles) として、Zilliz Cloud Web コンソールで 2 種類の personal API キーを確認できます。

    - **Your own personal API key**: 自分だけに属する personal キーです。この API キーを表示してコピーできます。

    - **Member's personal API key**: 組織またはプロジェクト内の他のユーザーに属する既存の personal キーの一覧です。これらのキーの名前と ID のみを表示できますが、キー自体は表示できません。

- **Customized API keys**: **Organization Owners** および **Project Admins** が、Zilliz Cloud アカウントを持たないアプリケーションまたは外部ユーザー向けに手動で作成します。これらのキーは長期的なアクセス要件に適しており、API キーの最初の作成者が組織を離れた場合でもサービスの継続性を確保できます。

<Admonition type="info" title="Notes">

本番環境では、代わりに customized キーを使用してください。Personal API keys はユーザーアカウントとともに削除されます。

</Admonition>

次の図は、API キーのロールとリソースへのアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づく API キーのアクセス範囲を詳しく示しています。ロールと権限の詳細については、[アクセス制御の概要](./access-control-overview) を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>API キーのロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Owner</p></td>
     <td><p>組織内のすべてのリソース（プロジェクト、クラスター、ボリュームを含む）に対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Billing Admin</p></td>
     <td><p>組織の請求に対する管理者アクセスのみ。組織内のプロジェクト、クラスター、ボリュームにはアクセスできません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Organization Member</p></td>
     <td><p>Project Admin</p></td>
     <td><p>指定されたプロジェクトに対する完全な管理者アクセス、およびデフォルトでそのプロジェクト内のすべてのクラスターとボリュームに対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Write</p></td>
     <td><p>指定されたプロジェクトに対する読み取りと書き込みのアクセス、およびデフォルトでそのプロジェクト内のすべてのクラスターとボリュームに対する読み取りと書き込みのアクセス。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Only</p></td>
     <td><p>指定されたプロジェクトに対する読み取り専用アクセス、およびデフォルトでそのプロジェクト内のすべてのクラスターとボリュームに対する読み取り専用アクセス。</p></td>
   </tr>
</table>

### 制限事項\{#limits-and-restrictions}

- データ操作を実行するには、代わりにクラスタートークンを使用してください。有効なクラスタートークンは、`user:pass` のように、コロンで区切られたクラスターのユーザー名とパスワードです。

- 各組織には、最大 100 個の customized API キーを含めることができます。

- API キーの管理権限は、組織およびプロジェクトにおけるユーザーのロールの影響を受けます。具体的な権限は次のとおりです。

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
         <td colspan="6"><p><strong>自分の personal API キー</strong></p></td>
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
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの personal API キー</strong></p></td>
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
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>customized API キー</strong></p></td>
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

Zilliz Cloud が各組織ユーザーに対して自動的に生成する personal キーとは別に、customized キーを作成できます。customized API キーを作成できるのは **Organization Owners** および **Project Admins** のみです。

<Procedures>

1. 組織の **API Keys** ページに移動します。**+ API Key** をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **API Key Name** を入力し、**API Key Access** を設定します。

    ![Td6mboU99oiRhVxvbYecZJf1nGC](https://zdoc-images.s3.us-west-2.amazonaws.com/td6mbou99oirhvxvbyeczjf1ngc.png "Td6mboU99oiRhVxvbYecZJf1nGC")

    - **API Key Name:** 名前は 64 文字を超えないようにしてください。

    - **API Key Description (optional)**: 作成する API キーの説明です。最大 255 文字です。

    - **API Key Access**: 適切な組織ロールとプロジェクトロールを割り当てて、現在の customized API キーのアクセス範囲を定義します。よりきめ細かなアクセス制御が必要な場合は、**Restrict Access to Specific クラスター and Volumes** をチェックして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" title="Notes">

        [Project Admins](./manage-platform-roles#predefined-project-roles) の場合、このユーザーが API キーに付与できる権限は、そのユーザー自身の権限範囲に限定されます。

        </Admonition>

</Procedures>

## API キーを表示する\{#view-api-keys}

組織の **API Keys** ページに移動します。表示される内容は、ご自身の[ロール](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **Organization Owner** の場合、自分の personal キー、すべてのメンバーの personal キー、およびすべての customized キーを表示できます。

- **Project Admin** の場合、自分の personal キーと、自分の権限範囲内にあるメンバーの personal キーおよび customized キーを表示できます。たとえば、*User 1* が *Project A* のみの Project Admin であり、*Key 1* が *Projects A*、*B*、*C* に対する Admin アクセスを持つ場合、*Key 1* のアクセス範囲は *User 1* の権限を超えているため、*User 1* には *Key 1* が表示されません。

- **Organization Billing Admin**、**Project Read-Write**、または **Project Read-Only** の場合は、自分の personal API キーのみを表示できます。

以下のスクリーンショットは、**Organization Owner** の API キー表示画面を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## API キーを編集する\{#edit-an-api-key}

現在、編集できるのは customized API キーのみです。personal キーはアカウントユーザーに紐付けられているため、編集できません。personal キーのアクセス範囲を変更するには、まずユーザーの組織ロールとプロジェクトロールを調整する必要があります。ユーザーのロールに対する変更は、キーのアクセス権限に自動的に反映されます。

以下の手順では、customized API キーを編集する方法を説明します。

<Procedures>

1. 組織の **API Keys** ページに移動します。操作列の **...** をクリックし、**Edit** をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. API キーの **API Key Name** と **API Key Access** を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API Key Name:** 名前は 64 文字を超えないようにしてください。

    - **API Key Access**: 適切な組織ロールとプロジェクトロールを割り当てて、現在の customized API キーのアクセス範囲を定義します。よりきめ細かなアクセス制御が必要な場合は、**Restrict Access to Specific クラスター and Volumes** をチェックして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" title="Notes">

        [Project Admins](./manage-platform-roles#predefined-project-roles) の場合、このユーザーが API キーに付与できる権限は、そのユーザー自身の権限範囲に限定されます。

        </Admonition>

</Procedures>

## API キーをリセットする\{#reset-an-api-key}

personal または customized API キーが漏洩した可能性がある場合は、直ちにリセットしてください。

<Admonition type="warning" title="Warning">

この操作により、現在の API キーはリセットされ、無効になります。このキーを使用しているアプリケーションコードは、新しいキー値で関連するコードを更新するまで動作しなくなります。

</Admonition>

キーの種類によって、手順が異なります。

- **Reset personal API keys**: ロールに関係なく、自分自身の personal API キーのみをリセットできます。

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **Reset customized API keys**: customized API キーをリセットできるのは Organization Owners と Project Admins のみです。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## API キーを削除する\{#delete-an-api-key}

customized API キーが使用されなくなった場合は、できるだけ早く削除してください。customized API キーを削除できるのは **Organization Owners** および **Project Admins** のみです。

personal キーは手動で削除できません。ただし、対応するユーザーが組織を離れると、自動的に無効化されて削除されます。

以下のスクリーンショットは、customized API キーを削除する方法を示しています。

<Admonition type="warning" title="Warning">

API キーを削除すると、そのキーを使用しているすべてのサービスの Zilliz Cloud リソースへのアクセスが不可逆的に終了します。

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## FAQ\{#faq}

**本番環境で personal API キーを使用してもよいですか？**

いいえ。**Personal API keys** は個々のユーザーアカウントに紐付けられており、ユーザーが組織を離れると自動的に削除されます。キー所有者のアカウントが削除されると、そのキーに依存しているアプリケーションやサービスは直ちに Zilliz Cloud リソースへのアクセスを失います。

本番環境では、代わりに **customized API keys** を使用してください。customized キーは特定の個人ユーザーアカウントに依存しないため、チームメンバーが組織を離れた場合でもサービスの継続性を確保できます。


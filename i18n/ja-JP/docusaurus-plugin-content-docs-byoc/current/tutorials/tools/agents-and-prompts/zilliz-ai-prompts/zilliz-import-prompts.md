---
title: "Import | BYOC"
slug: /zilliz-import-prompts
sidebar_label: "Import"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。 | BYOC"
type: origin
token: WRuXwuBYli07B5kudtCc1Omanyh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Import

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。

## これらのプロンプトの使用方法\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、AI ツールでのチャット時に含めてください。以下の表は、各種ツールでプロンプトを配置する場所を示しています。

| **ツール** | **プロンプトの配置場所** | **参考** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトをプロジェクトルールに追加します。 | [プロジェクトルールを設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## Prompt\{#prompt}

````plaintext
  # Zilliz Cloud Import Prompt
  Zilliz Cloud へのデータのインポートを手伝ってください。

  あなたは Zilliz Cloud に精通したアシスタントです。Zilliz Cloud の公式なインポートの概念と制約を使用してください。

  ## 次の違いを明確に区別する必要があります。
  - 小規模または継続的な書き込み向けの direct insert または upsert
  - 大規模な準備済みデータセット向けの bulk import
  - volume 経由のインポート
  - external object storage 経由のインポート
  - ソースファイルがサポートされている形式ではない場合の BulkWriter によるデータ準備

  ## 次の Zilliz Cloud ルールに従う必要があります。
  - Import には、スキーマが一致する既存のターゲット collection が必要です。
  - 準備済みファイルは、サポートされているインポート形式を使用する必要があります。
  - volume ベースの import では、volume とターゲット cluster が同じクラウドプロバイダーおよびリージョンに存在する必要があります。
  - volume は AWS と GCP でサポートされています。Azure で volume を使用するにはサポートの関与が必要です。
  - Bulk import は、大規模な 1 回限りのロードやバッチロードには、行単位の insert より適しています。
  - ユーザーが生のソースデータから開始する場合は、必要に応じてまず BulkWriter を推奨してください。
  - 関連する制限が重要な場合は、次を含めて言及してください。
    - collection あたり最大 10,000 件の実行中または保留中の import job
    - ローカルコンソールのアップロード制限は 1 GB
    - プランに応じた object storage import の制限
    
  ## インポート方法の比較
   |---| Local File Import | Volume Import | External Storage Import |                                                                     
   |---|---|---|---|                                                                                             
   | *データの場所* | ローカルマシン | Zilliz Cloud 管理 volume | 独自の S3 / GCS / Azure |                                                    
   | *データ移動* | ローカルから Zilliz Cloud へアップロード | まず volume にアップロードし、その後インポート | 直接 — ステージング手順なし |                                        
   | *認証情報* | Cluster token のみ | Volume access はプラットフォームにより管理 | リクエストで access key / secret を指定 |                                       
   | *最適な用途* | 小規模データセット、簡単なテスト、プロトタイピング | 繰り返しインポート、データがすでに volume 内にある場合 | 1 回限りのインポート、データを自分の bucket に保持する場合 |
   | *ファイル形式* | Parquet, JSON | Parquet, JSON | Parquet, JSON |                                                                    
   | *スケール* | ローカルマシンとネットワーク帯域幅により制限 | 大規模、サーバーサイド転送 | 大規模、サーバーサイド転送 |  

  ## 回答時:
  1. 適切な取り込みパスを選択する
  2. 前提条件を説明する
  3. 正確な手順を示す
  4. コード例を含める
  5. 検証と失敗時のチェックを含める
  6. 制限、リージョンの制約、コストまたは運用上の注意点を列挙する

  ## 必要に応じて簡潔なフォローアップ質問をしてください。
  - データソースは何ですか: ローカルファイル、object storage、または Zilliz Cloud volume ですか?
  - データはすでにインポート可能な形式で準備されていますか?
  - 希望する SDK またはインターフェイスは何ですか: Python、Java、REST、または console ですか?
  - データセットのサイズはどのくらいですか?
  - これは 1 回限りのロード、定期的なバッチインポート、または継続的な取り込みですか?

  ## 確認すべき一般的なミス:
  - ファイルとスキーマが一致しない collection にインポートしている
  - volume と cluster が異なるリージョンにある
  - 生の未準備データを bulk import しようとしている
  - direct insert の方が簡単な場合に bulk import を使用している
  - object storage の認証情報がない、またはファイルパスが間違っている
  - 送信後に import job のステータスを確認していない

  ## 例
  ### Volume 経由のインポート                                                                                                                                                                                      
  ```
  from pymilvus import MilvusClient                                                                                                                                                                         
  from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType                                                                                                                                         
                                                                                                                                                                                                            
  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",                                                                                                                                                                  
      token="YOUR_CLUSTER_TOKEN",                                                                                                                                                                         
  )

  # Step 1: List volumes
  resp = client.list_import_volumes()
  print(resp)

  # Step 2: Write data files to the volume
  schema = client.describe_collection("my_collection")["schema"]

  writer = RemoteBulkWriter(
      schema=schema,
      remote_path="my_import_batch/",
      connect_param=RemoteBulkWriter.S3ConnectParam(                                                                                                                                                        
          bucket_name="YOUR_VOLUME_BUCKET",
          access_key="YOUR_ACCESS_KEY",                                                                                                                                                                     
          secret_key="YOUR_SECRET_KEY",                                                                                                                                                                   
          endpoint="https://s3.amazonaws.com",
      ),                                                                                                                                                                                                    
      file_type=BulkFileType.PARQUET,
  )                                                                                                                                                                                                         
                                                                                                                                                                                                          
  for i in range(1000):                                                                                                                                                                                     
      writer.append_row({
          "id": i,                                                                                                                                                                                          
          "text": f"document {i}",                                                                                                                                                                        
          "dense_vector": [0.1] * 768,                                                                                                                                                                      
      })
  writer.commit()                                                                                                                                                                                           
                                                                                                                                                                                                          
  # Step 3: Import from volume into collection
  resp = client.bulk_import(
      collection_name="my_collection",
      files=[["my_import_batch/1.parquet"]],                                                                                                                                                                
  )
  job_id = resp.data["jobId"]                                                                                                                                                                               
                                                                                                                                                                                                          
  # Step 4: Check progress                                                                                                                                                                                  
  progress = client.get_import_progress(job_id=job_id)
  print(progress)                                                                                                                                                                                           
  ```                                                                                                                                                                                                          
  
  ### External Storage 経由のインポート                                                                                                                                                                            
  ```                                                                                                                                                                                                        
  from pymilvus import MilvusClient

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )                                                                                                                                                                                                         
   
  # From AWS S3                                                                                                                                                                                                 
  resp = client.bulk_import(                                                                                                                                                                              
      collection_name="my_collection",
      files=[["data/batch_001.parquet"]],
      options={
          "sourceType": "s3",
          "bucketName": "my-data-bucket",                                                                                                                                                                   
          "rootPath": "exports/embeddings/",
          "region": "us-east-1",                                                                                                                                                                            
          "accessKey": "YOUR_AWS_ACCESS_KEY",                                                                                                                                                             
          "secretKey": "YOUR_AWS_SECRET_KEY",
      },                                                                                                                                                                                                    
  )
  job_id = resp.data["jobId"]                                                                                                                                                                               
                                                                                                                                                                                                          
  # From Google Cloud Storage 
  resp = client.bulk_import(
      collection_name="my_collection",
      files=[["data/batch_001.parquet"]],
      options={                                                                                                                                                                                             
          "sourceType": "gcs",
          "bucketName": "my-gcs-bucket",                                                                                                                                                                    
          "rootPath": "exports/embeddings/",                                                                                                                                                              
          "gcpCredential": "BASE64_ENCODED_SERVICE_ACCOUNT_JSON",
      },                                                                                                                                                                                                    
  )
                                                                                                                                                                                                            
  # From Azure Blob                                                                                                                                                                                       
  resp = client.bulk_import(
      collection_name="my_collection",
      files=[["data/batch_001.parquet"]],
      options={
          "sourceType": "azure",
          "bucketName": "my-azure-container",
          "rootPath": "exports/embeddings/",                                                                                                                                                                
          "accountName": "YOUR_STORAGE_ACCOUNT",
          "accountKey": "YOUR_STORAGE_KEY",                                                                                                                                                                 
      },                                                                                                                                                                                                  
  )

  # Check progress
  progress = client.get_import_progress(job_id=job_id)
  print(progress)  
  ```
  
  ## 検証ステップ

  インポートを開始した後、次を確認してください。
  - job が正常に作成された
  - job が完了状態に到達した
  - 行数が期待値と一致している
  - インポート済み collection に対して簡単な query または search が動作する

  ## 各パスを推奨するタイミング

  - 小規模または継続的な書き込みには insert/upsert を使用します。
  - 大規模なバッチロードには bulk import を使用します。
  - ソースデータがまだインポート可能な形式でない場合は BulkWriter を使用します。
  - 同じリージョン内で Zilliz 管理のステージングを使用したい場合は volume import を使用します。
  - データがすでに独自の bucket にある場合は external object storage import を使用します。
````

---
title: "Import | Cloud"
slug: /zilliz-import-prompts
sidebar_label: "Import"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: WRuXwuBYli07B5kudtCc1Omanyh
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - data import
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Import

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

<table>
   <tr>
     <th><p><strong>Tool</strong></p></th>
     <th><p><strong>Where to place the prompt</strong></p></th>
     <th><p><strong>Reference</strong></p></th>
   </tr>
   <tr>
     <td><p>Claude Code</p></td>
     <td><p>Include the prompt in your <code>CLAUDE.md</code> file.</p></td>
     <td><p><a href="https://code.claude.com/docs/en/memory">Store instructions and memories</a></p></td>
   </tr>
   <tr>
     <td><p>Cursor</p></td>
     <td><p>Add the prompt to your project rules.</p></td>
     <td><p><a href="https://docs.cursor.com/en/context/rules">Configure project rules</a></p></td>
   </tr>
   <tr>
     <td><p>GitHub Copilot</p></td>
     <td><p>Save the prompt to a file in your project and reference it using <code>#&lt;filename&gt;</code>.</p></td>
     <td><p><a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions">Custom instructions in Copilot</a></p></td>
   </tr>
   <tr>
     <td><p>Gemini CLI</p></td>
     <td><p>Include the prompt in your <code>GEMINI.md</code> file.</p></td>
     <td><p><a href="https://codelabs.developers.google.com/gemini-cli-hands-on">Gemini CLI codelab</a></p></td>
   </tr>
</table>

## Prompt

```plaintext
  # Zilliz Cloud Import Prompt
  Help me import data into Zilliz Cloud.

  You are an expert Zilliz Cloud assistant. Use official Zilliz Cloud import concepts and constraints.

  ## You must distinguish clearly between:
  - direct insert or upsert for smaller or continuous writes
  - bulk import for large prepared datasets
  - import via volume
  - import via external object storage
  - data preparation with BulkWriter when the source files are not already in a supported format

  ## You must follow these Zilliz Cloud rules:
  - Import requires an existing target collection with a matching schema.
  - Prepared files must use supported import formats.
  - For volume-based import, the volume and target cluster must be in the same cloud provider and region.
  - Volumes are supported on AWS and GCP; Azure volume usage requires support involvement.
  - Bulk import is better for large one-time or batched loads than row-by-row inserts.
  - If the user is starting from raw source data, recommend BulkWriter first when needed.
  - Mention relevant limits when they matter, including:
    - up to 10,000 running or pending import jobs per collection
    - local console upload limit of 1 GB
    - object storage import limits depending on plan
    
  ## Import method comparison
   |---| Local File Import | Volume Import | External Storage Import |                                                                     
   |---|---|---|---|                                                                                             
   | *Data location* | Your local machine | Zilliz Cloud managed volume | Your own S3 / GCS / Azure |                                                    
   | *Data movement* | Upload from local to Zilliz Cloud | Upload to volume first, then import | Direct — no staging step |                                        
   | *Credentials* | Cluster token only | Volume access managed by platform | You provide access key / secret in the request |                                       
   | *Best for* | Small datasets, quick testing, prototyping | Repeated imports, data already in volume | One-time imports, data stays in your bucket |
   | *File format* | Parquet, JSON | Parquet, JSON | Parquet, JSON |                                                                    
   | *Scale* | Limited by local machine and network bandwidth | Large-scale, server-side transfer | Large-scale, server-side transfer |  

  ## When answering:
  1. choose the right ingestion path
  2. explain prerequisites
  3. show exact steps
  4. include code examples
  5. include validation and failure checks
  6. list limits, region constraints, and cost or operational caveats

  ## Ask concise follow-up questions if needed:
  - What is the data source: local files, object storage, or a Zilliz Cloud volume?
  - Is the data already prepared in an importable format?
  - What SDK or interface do you want: Python, Java, REST, or console?
  - How large is the dataset?
  - Is this a one-time load, recurring batch import, or continuous ingestion?

  ## Common mistakes to check for:
  - importing into a collection whose schema does not match the files
  - using volume and cluster in different regions
  - trying to bulk import raw unprepared data
  - using bulk import when direct insert is simpler
  - missing object storage credentials or wrong file paths
  - not checking import job status after submission

  ## Examples
  ### Import via Volume                                                                                                                                                                                      
  \`\`\`
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
  \`\`\`                                                                                                                                                                                                          
  
  ### Import via External Storage                                                                                                                                                                            
  \`\`\`                                                                                                                                                                                                        
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
          "bucketName": "my-ali-cn-hangzhou",
          "rootPath": "exports/embeddings/",                                                                                                                                                                
          "accountName": "YOUR_STORAGE_ACCOUNT",
          "accountKey": "YOUR_STORAGE_KEY",                                                                                                                                                                 
      },                                                                                                                                                                                                  
  )

  # Check progress
  progress = client.get_import_progress(job_id=job_id)
  print(progress)  
  \`\`\`
  
  ## Validation step

  After starting the import, verify:
  - the job was created successfully
  - the job reaches a completed state
  - row count matches expectation
  - a simple query or search works against the imported collection

  ## When to recommend each path

  - Use insert/upsert for small or continuous writes.
  - Use bulk import for large batch loads.
  - Use BulkWriter if source data is not already in an import-ready format.
  - Use volume import when you want Zilliz-managed staging in the same region.
  - Use external object storage import when your data already lives in your own bucket.
```

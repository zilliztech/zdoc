---
title: "Example Dataset | BYOC"
slug: /example-dataset
sidebar_label: "Example Dataset"
beta: FALSE
notebook: FALSE
description: "In this user guide series, we'll explore an example dataset comprising details of over 5,000 Medium articles. These were published between January 2020 and August 2020 in notable publications. | BYOC"
type: origin
token: FCgWwFVtQiUy9GkDlQNcA0xZnPa
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - example dataset
  - milvus

---

import Admonition from '@theme/Admonition';


# Example Dataset

In this user guide series, we'll explore an example dataset comprising details of over 5,000 Medium articles. These were published between January 2020 and August 2020 in notable publications.

## Acquire the dataset{#acquire-the-dataset}

The dataset resides in a publicly accessible S3 storage bucket. To fetch it, execute the following command:

```bash
# Get a CSV version of the dataset
curl https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.csv \
        --output medium_articles_2020_dpr.csv

# Get a JSON version of the dataset
curl https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.json \
        --output medium_articles_2020_dpr.json
```

Expected output

```bash
# Output
#
# % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
#                                  Dload  Upload   Total   Spent    Left  Speed
# 100 60.4M  100 60.4M    0     0  12.8M      0  0:00:04  0:00:04 --:--:-- 12.9M
```

For a comprehensive understanding of the dataset, refer to its [introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset).

The acquired dataset is in JSON format, with a structure resembling:

```json
{
      "root": [
         {
             "id": ...
             "title_vector": ...
             "title": ...
             "link": ...             
             "reading_time": ...             
             "publication": ...             
             "claps": ...             
             "responses": ...         
         },
         ...     
      ]  
 }
```

## Dataset schema{#dataset-schema}

Each record in the dataset possesses eight attributes. Familiarize yourself with this structure as it will guide you when establishing the schema for your collection.

<table>
   <tr>
     <th><p><strong>Field Name</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Attributes</strong></p></th>
   </tr>
   <tr>
     <td><p>id</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>title_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dimension: 768</p></td>
   </tr>
   <tr>
     <td><p>title</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
   </tr>
   <tr>
     <td><p>link</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
   </tr>
   <tr>
     <td><p>reading_time</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>publication</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
   </tr>
   <tr>
     <td><p>claps</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>responses</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

---
slug: /example-dataset-1
beta: FALSE
notebook: FALSE
sidebar_position: 4
---



# Example Dataset

In this user guide series, we'll explore an example dataset comprising details of over 5,000 Medium articles. These were published between January 2020 and August 2020 in notable publications.

## Acquire the dataset{#acquire-the-dataset}

The dataset resides in a publicly accessible S3 storage bucket. To fetch it, execute the following command:

```bash
curl <https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.json> \\
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
             "titile_vector": ...
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

|  **Field Name** |  **Type**     |  **Attributes**  |
| --------------- | ------------- | ---------------- |
|  id             |  INT64        |  N/A             |
|  title_vector   |  FLOAT_VECTOR |  Dimension: 768  |
|  title          |  VARCHAR      |  Max length: 512 |
|  link           |  VARCHAR      |  Max length: 512 |
|  reading_time   |  INT64        |  N/A             |
|  publication    |  VARCHAR      |  Max length: 512 |
|  claps          |  INT64        |  N/A             |
|  responses      |  INT64        |  N/A             |

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster) 

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection-1) 

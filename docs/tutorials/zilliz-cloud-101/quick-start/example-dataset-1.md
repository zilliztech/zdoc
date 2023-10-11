---
slug: /example-dataset-1
sidebar_position: 5
---



# Example Dataset

Throughout this user guide series, we will use an example dataset that contains details about over 5,000 Medium articles published between January 2020 and August 2020 in prominent publications.

## Grab dataset{#grab-dataset}

This dataset is available in a public S3 storage bucket. Use the following code to download the file:

```bash
curl <https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.json> \\
        --output medium_articles_2020_dpr.json

# Output
#
# % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
#                                  Dload  Upload   Total   Spent    Left  Speed
# 100 60.4M  100 60.4M    0     0  12.8M      0  0:00:04  0:00:04 --:--:-- 12.9M
```

To know more about the dataset, read [the introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset).

The downloaded dataset is a JSON file, and its structure looks similar to the following:

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

In the dataset, each data record has eight attributes. Use this table as a reference when you create the schema of your collection.

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

- [Search and Query](./search-and-query) 

- [Drop Collection](./drop-collection-1) 

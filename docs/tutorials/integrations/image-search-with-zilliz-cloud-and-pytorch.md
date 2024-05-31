---
slug: /image-search-with-zilliz-cloud-and-pytorch
sidebar_label: With PyTorch
beta: FALSE
notebook: FALSE
type: origin
token: XnWswbO9Zi4sykkgRzec8el8nyd
sidebar_position: 5

---

import Admonition from '@theme/Admonition';


# Image Search with Zilliz Cloud and PyTorch

On this page, we are going to go over a simple image search example using Zilliz Cloud. The dataset we are searching through is the Impressionist-Classifier Dataset found on [Kaggle](https://www.kaggle.com/datasets/delayedkarma/impressionist-classifier-data). For this example, we have re-hosted the data in a public google drive.

For this example, we are just using a 1 CU cluster and using the Torchvision pre-trained ResNet50 model for embeddings. Let's get started!

## Before you start{#before-you-start}

For this example, we are going to use `pymilvus` to connect to Zilliz Cloud, `torch` to run the embedding model, `torchvision` for the actual model and preprocessing, `gdown` to download the example dataset and `tqdm` for loading bars.

```bash
pip install pymilvus torch gdown torchvision tqdm
```

## Prepare data{#prepare-data}

We are going to use `gdown` to grab the zip from Google Drive and then decompress it with the built-in `zipfile` library.

```python
import gdown
import zipfile

url = '<https://drive.google.com/uc?id=1OYDHLEy992qu5C4C8HV5uDIkOWRTAR1_>'
output = './paintings.zip'
gdown.download(url, output)

with zipfile.ZipFile("./paintings.zip","r") as zip_ref:
    zip_ref.extractall("./paintings")
```

<Admonition type="info" icon="📘" title="Notes">

<p>The size of the dataset is 2.35 GB, and the time spent depends on your network condition.</p>

</Admonition>

## Parameters{#parameters}

These are some of the main global arguments that we will be using for easier tracking and updating.

```python
# 1. Set up the name of the collection to be created.
COLLECTION_NAME = 'image_search_db'

# 2. Set up the dimension of the embeddings.
DIMENSION = 2048

# 3. Set the inference parameters
BATCH_SIZE = 128
TOP_K = 3

# 4. Set up the connection parameters for your Zilliz Cloud cluster.
URI = 'YOUR_CLUSTER_ENDPOINT'
TOKEN = 'YOUR_CLUSTER_TOKEN'
```

## Setting up Zilliz Cloud{#setting-up-zilliz-cloud}

At this point, we are going to begin setting up Zilliz Cloud. The steps are as follows:

1. Connect to the Zilliz Cloud cluster using the provided URI.

    ```python
    from pymilvus import connections
    
    # Connect to Zilliz Cloud and create a collection
    connections.connect(
        alias='default',
        # Public endpoint obtained from Zilliz Cloud
        uri=URI,
        token=TOKEN
    )
    ```

1. If the collection already exists, drop it.

    ```python
    from pymilvus import utility
    
    # Remove any previous collections with the same name
    if COLLECTION_NAME in utility.list_collections():
        utility.drop_collection(COLLECTION_NAME)
    ```

1. Create the collection that holds the ID, the file path of the image, and its embedding.

    ```python
    from pymilvus import FieldSchema, CollectionSchema, DataType, Collection
    
    fields = [
        FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name='filepath', dtype=DataType.VARCHAR, max_length=200),  # VARCHARS need a maximum length, so for this example they are set to 200 characters
        FieldSchema(name='image_embedding', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION)
    ]
    
    schema = CollectionSchema(fields=fields)
    
    collection = Collection(
        name=COLLECTION_NAME,
        schema=schema,
    )
    ```

1. Create an index on the newly created collection and load it into memory.

    ```python
    index_params = {
        'index_type': 'AUTOINDEX',
        'metric_type': 'L2',
        'params': {}
    }
    
    collection.create_index(
        field_name='image_embedding', 
        index_params=index_params
    )
    
    collection.load()
    ```

Once these steps are done the collection is ready to be inserted into and searched. Any data added will be indexed automatically and be available to search immediately. If the data is very fresh, the search might be slower as brute force searching will be used on data that is still in process of getting indexed.

## Insert data{#insert-data}

In this example, we will use the ResNet50 model from the `torch` library and its model hub. To obtain embeddings, we will remove the final classification layer, resulting in the model providing embeddings of 2048 dimensions. All vision models found on `torch` use the same preprocessing method, which we have included here.

In the following steps, we will:

1. Load the data.

    ```python
    import glob
    
    # Get the filepaths of the images
    paths = glob.glob('./paintings/paintings/**/*.jpg', recursive=True)
    len(paths)
    
    # Output
    #
    # 4978
    ```

1. Preprocess the data into batches.

    ```python
    import torch
    
    # Load the embedding model with the last layer removed
    model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', weights=ResNet50_Weights.DEFAULT)
    model = torch.nn.Sequential(*(list(model.children())[:-1]))
    model.eval()
    ```

1. Embed the data.

    ```python
    from torchvision import transforms
    
    # Preprocessing for images
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    ```

1. Insert the data.

    ```python
    from PIL import Image
    from tqdm import tqdm
    
    # Embed function that embeds the batch and inserts it
    def embed(data):
        with torch.no_grad():
            output = model(torch.stack(data[0])).squeeze()
            collection.insert([data[1], output.tolist()])
    
    data_batch = [[],[]]
    
    # Read the images into batches for embedding and insertion
    for path in tqdm(paths):
        im = Image.open(path).convert('RGB')
        data_batch[0].append(preprocess(im))
        data_batch[1].append(path)
        if len(data_batch[0]) % BATCH_SIZE == 0:
            embed(data_batch)
            data_batch = [[],[]]
    
    # Embed and insert the remainder
    if len(data_batch[0]) != 0:
        embed(data_batch)
    
    # Call a flush to index any unsealed segments.
    time.sleep(5)
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>This step is relatively time-consuming because embedding takes time. Take a sip of coffee and relax.</p>
    <p>PyTorch may not work well with Python 3.9 and earlier versions. Considering using Python 3.10 and later versions instead.</p>

    </Admonition>

## Perform search{#perform-search}

With all the data inserted into Zilliz Cloud, we can start performing our searches. In this example, we are going to search for two example images. Because we are doing a batch search, the search time is shared across the images of the batch.

```python
import glob

# Get the filepaths of the search images
search_paths = glob.glob('./paintings/test_paintings/**/*.jpg', recursive=True)
print(len(search_paths))

# Output
#
# 2

import time
from matplotlib import pyplot as plt

# Embed the search images
def embed(data):
    with torch.no_grad():
        ret = model(torch.stack(data))
        # If more than one image, use squeeze
        if len(ret) > 1:
            return ret.squeeze().tolist()
        # Squeeze would remove batch for single image, so using flatten
        else:
            return torch.flatten(ret, start_dim=1).tolist()

data_batch = [[],[]]

for path in search_paths:
    im = Image.open(path).convert('RGB')
    data_batch[0].append(preprocess(im))
    data_batch[1].append(path)

embeds = embed(data_batch[0])
start = time.time()
res = collection.search(embeds, anns_field='image_embedding', param={}, limit=TOP_K, output_fields=['filepath'])
finish = time.time()

# Show the image results
f, axarr = plt.subplots(len(data_batch[1]), TOP_K + 1, figsize=(20, 10), squeeze=False)

for hits_i, hits in enumerate(res):
    axarr[hits_i][0].imshow(Image.open(data_batch[1][hits_i]))
    axarr[hits_i][0].set_axis_off()
    axarr[hits_i][0].set_title('Search Time: ' + str(finish - start))
    for hit_i, hit in enumerate(hits):
        axarr[hits_i][hit_i + 1].imshow(Image.open(hit.entity.get('filepath')))
        axarr[hits_i][hit_i + 1].set_axis_off()
        axarr[hits_i][hit_i + 1].set_title('Distance: ' + str(hit.distance))

# Save the search result in a separate image file alongside your script.
plt.savefig('search_result.png')
```

The search result image should be similar to the following:

![image_search](/img/image_search.png)

## Related integrations{#related-integrations}

- [Similarity Search with Zilliz Cloud and OpenAI](./similarity-search-with-zilliz-cloud-and-openai)

- [Question Answering Using Zilliz Cloud and HuggingFace](./question-answering-using-zilliz-cloud-and-hugging-face)

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere)

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain)

- [Documentation QA using Zilliz Cloud and LlamaIndex](./rag-with-zilliz-cloud-and-llamaindex)

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 


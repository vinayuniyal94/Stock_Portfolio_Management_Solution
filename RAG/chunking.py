import os
from typing import List
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def load_documents_from_folder(doc_folder: str = "RAG/documents") -> List[Document]:
    """Loads all .txt, .md, and .pdf documents from the specified folder."""
    if not os.path.exists(doc_folder):
        os.makedirs(doc_folder, exist_ok=True)
        return []

    docs = []
    for file in os.listdir(doc_folder):
        file_path = os.path.join(doc_folder, file)
        try:
            if file.endswith(".txt") or file.endswith(".md"):
                loader = TextLoader(file_path, encoding="utf-8")
                docs.extend(loader.load())
            elif file.endswith(".pdf"):
                loader = PyPDFLoader(file_path)
                docs.extend(loader.load())
        except Exception as e:
            print(f"Error loading {file}: {e}")

    return docs


def split_documents(
    docs: List[Document], chunk_size: int = 700, chunk_overlap: int = 120
) -> List[Document]:
    """Applies RecursiveCharacterTextSplitter with financial boundary separators."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n## ", "\n\n", "\n", ". ", " ", ""],
        length_function=len,
        is_separator_regex=False,
    )
    chunks = splitter.split_documents(docs)
    print(f"Loaded {len(docs)} document(s) and split into {len(chunks)} chunk(s).")
    return chunks


if __name__ == "__main__":
    test_docs = load_documents_from_folder("RAG/documents")
    print(f"Documents found: {len(test_docs)}")
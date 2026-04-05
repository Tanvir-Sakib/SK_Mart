import API from "./axios";

export const getProducts = () =>
  API.get("/products");
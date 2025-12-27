package com.smd.public_service.dto;

import java.util.List;

public class SearchResponse {

    private long total;
    private int page;
    private int size;
    private List<SyllabusSummary> results;

    public SearchResponse() {
    }

    public SearchResponse(long total, int page, int size, List<SyllabusSummary> results) {
        this.total = total;
        this.page = page;
        this.size = size;
        this.results = results;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public List<SyllabusSummary> getResults() {
        return results;
    }

    public void setResults(List<SyllabusSummary> results) {
        this.results = results;
    }
}

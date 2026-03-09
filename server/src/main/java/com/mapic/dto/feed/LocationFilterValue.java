package com.mapic.dto.feed;

public enum LocationFilterValue {
    NEARBY("Gần đây"),
    MY_CITY("Thành phố của tôi"),
    PLACES_VISITED("Nơi đã đến"),
    TRENDING_NEARBY("Xu hướng gần đây");

    private final String label;

    LocationFilterValue(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

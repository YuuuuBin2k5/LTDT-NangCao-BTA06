package com.mapic.dto.feed;

public enum SocialFilterValue {
    FRIENDS("Bạn bè"),
    FRIENDS_OF_FRIENDS("Bạn của bạn bè"),
    FOLLOWING("Đang theo dõi"),
    MUTUAL_FRIENDS("Bạn chung");

    private final String label;

    SocialFilterValue(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

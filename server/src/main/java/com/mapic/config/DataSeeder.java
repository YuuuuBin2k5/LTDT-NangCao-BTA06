package com.mapic.config;

import com.mapic.entity.AvatarFrame;
import com.mapic.repository.AvatarFrameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AvatarFrameRepository avatarFrameRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and seeding Avatar Frames...");

        List<AvatarFrame> framesToSeed = Arrays.asList(
            AvatarFrame.builder()
                .id("frame-1-basic")
                .name("Người mới")
                .description("Khung cơ bản dành cho mọi người")
                .frameType(AvatarFrame.FrameType.SQUARE)
                .svgPath("")
                .isPremium(false)
                .unlockCondition("Đạt cấp độ 1")
                .unlockRequirementValue(0)
                .displayOrder(1)
                .build(),
            AvatarFrame.builder()
                .id("frame-2-bronze")
                .name("Đồng")
                .description("Khung đồng dành cho người mới bắt đầu")
                .frameType(AvatarFrame.FrameType.CIRCULAR)
                .svgPath("")
                .isPremium(false)
                .unlockCondition("Chi phí: 100 EXP")
                .unlockRequirementValue(100)
                .displayOrder(2)
                .build(),
            AvatarFrame.builder()
                .id("frame-3-silver")
                .name("Bạc")
                .description("Khung bạc mang lại vẻ đẹp chuyên nghiệp")
                .frameType(AvatarFrame.FrameType.CIRCULAR)
                .svgPath("")
                .isPremium(false)
                .unlockCondition("Chi phí: 500 EXP")
                .unlockRequirementValue(500)
                .displayOrder(3)
                .build(),
            AvatarFrame.builder()
                .id("frame-4-gold")
                .name("Vàng")
                .description("Khung vàng sang trọng")
                .frameType(AvatarFrame.FrameType.STAR)
                .svgPath("")
                .isPremium(true)
                .unlockCondition("Chi phí: 1000 EXP")
                .unlockRequirementValue(1000)
                .displayOrder(4)
                .build(),
            AvatarFrame.builder()
                .id("frame-5-diamond")
                .name("Kim cương")
                .description("Khung kim cương lấp lánh")
                .frameType(AvatarFrame.FrameType.HEART)
                .svgPath("")
                .isPremium(true)
                .unlockCondition("Chi phí: 2000 EXP")
                .unlockRequirementValue(2000)
                .displayOrder(5)
                .build(),
            AvatarFrame.builder()
                .id("frame-6-neon")
                .name("Neon")
                .description("Khung Neon rực rỡ nhất")
                .frameType(AvatarFrame.FrameType.NEON)
                .svgPath("")
                .isPremium(true)
                .unlockCondition("Chi phí: 5000 EXP")
                .unlockRequirementValue(5000)
                .displayOrder(6)
                .build()
        );

        // Delete old unused frames
        List<String> validIds = framesToSeed.stream().map(AvatarFrame::getId).toList();
        List<AvatarFrame> existingFrames = avatarFrameRepository.findAll();
        for (AvatarFrame existingFrame : existingFrames) {
            if (!validIds.contains(existingFrame.getId())) {
                avatarFrameRepository.delete(existingFrame);
                log.info("Deleted legacy Avatar Frame: {}", existingFrame.getName());
            }
        }

        for (AvatarFrame f : framesToSeed) {
            if (!avatarFrameRepository.existsById(f.getId())) {
                avatarFrameRepository.save(f);
                log.info("Seeded Avatar Frame: {}", f.getName());
            } else {
                // Update existing
                AvatarFrame existing = avatarFrameRepository.findById(f.getId()).get();
                existing.setName(f.getName());
                existing.setDescription(f.getDescription());
                existing.setFrameType(f.getFrameType());
                existing.setIsPremium(f.getIsPremium());
                existing.setUnlockCondition(f.getUnlockCondition());
                existing.setUnlockRequirementValue(f.getUnlockRequirementValue());
                existing.setDisplayOrder(f.getDisplayOrder());
                avatarFrameRepository.save(existing);
            }
        }
    }
}

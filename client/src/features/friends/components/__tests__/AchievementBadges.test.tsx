import React from 'react';
import { render } from '@testing-library/react-native';
import { AchievementBadges, getDefaultAchievements } from '../AchievementBadges';

describe('AchievementBadges', () => {
  const mockStats = {
    totalSent: 150,
    heartsSent: 60,
    wavesSent: 40,
    pokesSent: 30,
    firesSent: 10,
    starsSent: 5,
    hugsSent: 5,
  };

  it('should render achievement badges', () => {
    const achievements = getDefaultAchievements(mockStats);
    const { getByText } = render(<AchievementBadges achievements={achievements} />);

    expect(getByText(/Thành tựu đã mở/)).toBeTruthy();
  });

  it('should display unlocked achievements', () => {
    const achievements = getDefaultAchievements(mockStats);
    const { getByText } = render(<AchievementBadges achievements={achievements} />);

    // Should show unlocked achievements
    expect(getByText('Bước đầu tiên')).toBeTruthy();
    expect(getByText('Bướm xã hội')).toBeTruthy();
    expect(getByText('Bậc thầy tương tác')).toBeTruthy();
  });

  it('should display locked achievements with progress', () => {
    const achievements = getDefaultAchievements(mockStats);
    const { getByText } = render(<AchievementBadges achievements={achievements} />);

    expect(getByText(/Thành tựu chưa mở/)).toBeTruthy();
  });

  it('should show progress for locked achievements', () => {
    const achievements = getDefaultAchievements({
      totalSent: 25,
      heartsSent: 10,
      wavesSent: 5,
      pokesSent: 5,
      firesSent: 3,
      starsSent: 1,
      hugsSent: 1,
    });

    const { getAllByText } = render(<AchievementBadges achievements={achievements} />);

    // Should show progress like "25 / 50" (there may be multiple)
    const progressTexts = getAllByText(/25 \/ 50/);
    expect(progressTexts.length).toBeGreaterThan(0);
  });

  it('should show empty state when no achievements', () => {
    const { getByText } = render(<AchievementBadges achievements={[]} />);

    expect(getByText('Chưa có thành tựu')).toBeTruthy();
    expect(getByText('Tương tác với bạn bè để mở khóa thành tựu')).toBeTruthy();
  });

  it('should count unlocked achievements correctly', () => {
    const achievements = getDefaultAchievements(mockStats);
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    const { getByText } = render(<AchievementBadges achievements={achievements} />);

    expect(getByText(`Thành tựu đã mở (${unlockedCount})`)).toBeTruthy();
  });

  it('should count locked achievements correctly', () => {
    const achievements = getDefaultAchievements(mockStats);
    const lockedCount = achievements.filter((a) => !a.unlocked).length;

    const { getByText } = render(<AchievementBadges achievements={achievements} />);

    expect(getByText(`Thành tựu chưa mở (${lockedCount})`)).toBeTruthy();
  });
});

describe('getDefaultAchievements', () => {
  it('should unlock first interaction achievement', () => {
    const achievements = getDefaultAchievements({
      totalSent: 1,
      heartsSent: 1,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const firstInteraction = achievements.find((a) => a.id === 'first_interaction');
    expect(firstInteraction?.unlocked).toBe(true);
  });

  it('should not unlock social butterfly with less than 50 interactions', () => {
    const achievements = getDefaultAchievements({
      totalSent: 49,
      heartsSent: 49,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const socialButterfly = achievements.find((a) => a.id === 'social_butterfly');
    expect(socialButterfly?.unlocked).toBe(false);
  });

  it('should unlock social butterfly with 50+ interactions', () => {
    const achievements = getDefaultAchievements({
      totalSent: 50,
      heartsSent: 50,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const socialButterfly = achievements.find((a) => a.id === 'social_butterfly');
    expect(socialButterfly?.unlocked).toBe(true);
  });

  it('should unlock interaction master with 100+ interactions', () => {
    const achievements = getDefaultAchievements({
      totalSent: 100,
      heartsSent: 100,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const master = achievements.find((a) => a.id === 'interaction_master');
    expect(master?.unlocked).toBe(true);
  });

  it('should unlock heart sender with 50+ hearts', () => {
    const achievements = getDefaultAchievements({
      totalSent: 50,
      heartsSent: 50,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const heartSender = achievements.find((a) => a.id === 'heart_sender');
    expect(heartSender?.unlocked).toBe(true);
  });

  it('should track progress correctly', () => {
    const achievements = getDefaultAchievements({
      totalSent: 25,
      heartsSent: 25,
      wavesSent: 15,
      pokesSent: 20,
      firesSent: 10,
      starsSent: 5,
      hugsSent: 5,
    });

    const socialButterfly = achievements.find((a) => a.id === 'social_butterfly');
    expect(socialButterfly?.progress).toBe(25);
    expect(socialButterfly?.requirement).toBe(50);
  });

  it('should unlock legendary with 500+ interactions', () => {
    const achievements = getDefaultAchievements({
      totalSent: 500,
      heartsSent: 500,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    const legendary = achievements.find((a) => a.id === 'legendary');
    expect(legendary?.unlocked).toBe(true);
  });

  it('should have correct achievement count', () => {
    const achievements = getDefaultAchievements({
      totalSent: 0,
      heartsSent: 0,
      wavesSent: 0,
      pokesSent: 0,
      firesSent: 0,
      starsSent: 0,
      hugsSent: 0,
    });

    expect(achievements).toHaveLength(10);
  });
});

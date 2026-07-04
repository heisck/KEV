import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { CalendarStrip } from '@/components/ui/CalendarStrip';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { CtaCard } from '@/components/ui/CtaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroCard } from '@/components/ui/HeroCard';
import { ListRow } from '@/components/ui/ListRow';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatTile } from '@/components/ui/StatTile';
import { StatusPill } from '@/components/ui/StatusPill';

describe('ui kit', () => {
  it('AppButton fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton label="Mark IN" onPress={onPress} />);
    fireEvent.press(getByText('Mark IN'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Card renders children per variant', () => {
    const { getByText } = render(
      <Card variant="ink">
        <Text>inside</Text>
      </Card>,
    );
    expect(getByText('inside')).toBeTruthy();
  });

  it('ChipRow selects a chip', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <ChipRow labels={['DCIT 301', 'DCIT 305']} activeLabel="DCIT 301" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('DCIT 305'));
    expect(onSelect).toHaveBeenCalledWith('DCIT 305');
  });

  it('Chip renders active state', () => {
    const { getByText } = render(<Chip label="Active" active />);
    expect(getByText('Active')).toBeTruthy();
  });

  it('StatusPill shows label', () => {
    const { getByText } = render(<StatusPill label="Eligible" tone="success" />);
    expect(getByText('Eligible')).toBeTruthy();
  });

  it('ListRow shows fallback initial when no avatar', () => {
    const { getByText } = render(<ListRow title="Ama Boateng" subtitle="10953001" />);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('10953001')).toBeTruthy();
  });

  it('AvatarStack shows overflow badge', () => {
    const { getByText } = render(<AvatarStack urls={[undefined, undefined, undefined]} max={2} />);
    expect(getByText('+1')).toBeTruthy();
  });

  it('HeroCard renders headline and CTA', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <HeroCard headline={['Every Student.', 'Verified.']} onPress={onPress} />,
    );
    expect(getByText(/Every Student\./)).toBeTruthy();
  });

  it('StatTile shows count badge', () => {
    const { getByText } = render(<StatTile label="Checked in" count={29} tone="primary" />);
    expect(getByText('29')).toBeTruthy();
  });

  it('ProgressRing renders clamped percentage', () => {
    const { getByText } = render(<ProgressRing progress={1.4} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('CalendarStrip renders a full week and selects a day', () => {
    const onSelect = jest.fn();
    const today = new Date(2026, 6, 4);
    const { getAllByText } = render(
      <CalendarStrip today={today} onSelect={onSelect} markedDates={[today]} />,
    );
    fireEvent.press(getAllByText('Mon')[0]);
    expect(onSelect).toHaveBeenCalled();
  });

  it('CtaCard fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CtaCard title="Quick scan" subtitle="NFC · QR · Manual" onPress={onPress} />,
    );
    fireEvent.press(getByText('Quick scan'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ScreenHeader greets the user', () => {
    const { getByText } = render(<ScreenHeader greeting="Good morning" name="Rebecca" />);
    expect(getByText('Rebecca')).toBeTruthy();
  });

  it('EmptyState renders title and message', () => {
    const { getByText } = render(<EmptyState title="No sessions yet" message="Create one." />);
    expect(getByText('No sessions yet')).toBeTruthy();
  });
});

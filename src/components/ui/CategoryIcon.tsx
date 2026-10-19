import BakeryDiningOutlinedIcon from '@mui/icons-material/BakeryDiningOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import LocalPizzaOutlinedIcon from '@mui/icons-material/LocalPizzaOutlined';
import RamenDiningOutlinedIcon from '@mui/icons-material/RamenDiningOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import SetMealOutlinedIcon from '@mui/icons-material/SetMealOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';

const ICONS = {
  bakery: BakeryDiningOutlinedIcon,
  meal: RamenDiningOutlinedIcon,
  coffee: LocalCafeOutlinedIcon,
  grocery: ShoppingBasketOutlinedIcon,
  sushi: SetMealOutlinedIcon,
  pizza: LocalPizzaOutlinedIcon,
} as const;

const BY_NAME: Record<string, keyof typeof ICONS> = {
  Випічка: 'bakery',
  'Готові страви': 'meal',
  'Кава й десерти': 'coffee',
  Продукти: 'grocery',
  Суші: 'sushi',
  Піца: 'pizza',
};

export function CategoryIcon({
  icon,
  name,
  ...props
}: SvgIconProps & { icon?: string | null; name?: string }) {
  const key = (icon && icon in ICONS ? icon : name ? BY_NAME[name] : undefined) as
    keyof typeof ICONS | undefined;
  const Icon = key ? ICONS[key] : RestaurantOutlinedIcon;
  return <Icon {...props} />;
}

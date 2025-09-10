const commonUtilities = {
  switchlabel2: 'lg:w-[100%] lg:p-[15px] lg:items-center',
  celltypo: 'lg:text-[#fff] lg:flex-no-wrap lg:text-[14px]',
  chip: 'lg:text-[#6545be] lg:rounded-[6px] lg:bg-[#d7d7fe]',
  childoutlinedcards:
    'lg:bg-[#11171aff] lg:flex lg:items-center lg:w-[100%] lg:py-[8px] lg:px-[10px] lg:rounded-[6px] lg:border-[1px] lg:border-solid lg:border-[#ccc]',
  childfilledcard:
    'lg:bg-[#05264cff] lg:flex lg:justify-start lg:items-center lg:pt-[16px] lg:pr-[0px] lg:pb-[16px] lg:pl-[12px] lg:w-[90%] lg:mt-[20px] lg:rounded-[8px] lg:gap-[10px]',
  label: 'lg:w-[fit-content] lg:text-[#4b565c] lg:text-[17px]',
  input: 'lg:bg-[None] lg:p-[10px] lg:border-none',
  thickgrey: 'lg:text-[#0d2036]',
  lightgrey: 'lg:text-[None]',
  listitemsfilled:
    'lg:text-[None] lg:flex lg:w-[100%] lg:items-center lg:py-[4px] lg:px-[10px]',
  outlinebutton:
    'lg:bg-[transparent] lg:text-[None] lg:font-[600] lg:items-center lg:border-[1px] lg:border-solid lg:w-[fit-content]',
  imagebox:
    'lg:bg-[None] lg:border-[1px] lg:border-solid lg:p-[20px] lg:w-[100%] lg:flex lg:items-center lg:justify-center',
  card: 'lg:flex lg:flex-col lg:border-none lg:items-start lg:gap-[15px] lg:w-[100%] lg:p-[5px]',
  outlineborder: 'lg:border-[1px] lg:border-solid lg:border-[#0d2036]',
  columncontainer: 'lg:items-start',
  label: 'lg:w-[fit-content]',
  input:
    'lg:w-[100%] lg:border-none lg:text-[16.5px] lg:font-rubik lg:whitespace-no-wrap lg:overflow-hidden',
  parentcontainer:
    'lg:bg-[#fff] lg:flex lg:flex-col lg:max-w-[1200px] lg:items-center lg:w-[100%] lg:p-[10px]',
  font500: 'lg:font-[500]',
  gray: 'lg:text-[gray]',
  bordernone: 'lg:border-none',
  border: 'lg:border-[1px] lg:border-solid',
  flexrow: 'lg:flex',
  flexcolumn: 'lg:flex lg:flex-col',
  main: 'lg:p-[1rem] lg:w-[100%] lg:bg-[#8e8e8eff] lg:flex lg:flex-col lg:gap-y-[10px]',
  inputlabel: 'lg:flex lg:flex-col lg:gap-y-[5px]',
  spacebetween: 'lg:flex lg:justify-between lg:items-center',
  chip: 'lg:flex lg:items-center lg:justify-center lg:gap-[5px] lg:text-[#62a6e0ff] lg:bg-[#e6f4feff] lg:p-[3px] lg:w-[150px]',
  flexrow:
    'lg:flex lg:gap-x-[10px] lg:items-center lg:no-underline lg:text-[#4338ca] lg:py-[5px] lg:px-[0px]',
  divider: 'lg:bg-[#fff] lg:h-[0.3px] lg:w-[100%]',
  tabledata: 'lg:text-[14px] lg:text-[#fb7185]',
  childcards: 'lg:bg-[#0d2036] lg:py-[15px] lg:px-[20px] lg:w-[100%]',
  inputbox:
    'lg:bg-[#0d2036] lg:border-[1px] lg:border-solid lg:border-[#fb7185] lg:text-[#fb7185] lg:w-[63%] lg:p-[12px] lg:rounded-[4px] lg:text-[14px]',
  rowContainerAlignCentre: 'lg:items-center',
  listitem: 'lg:flex lg:items-center lg:gap-x-[25px] lg:mb-[33px]',
  alignstart: 'lg:items-start',
  screen: 'lg:bg-[#fb7185] lg:text-[#0d2036]',
  linktext: 'lg:text-[#2b74d9ff] lg:no-underline lg:text-[14px] lg:font-[600]',
  colflex: 'lg:flex lg:flex-col',
  parent:
    'lg:flex lg:flex-col lg:bg-[#fff] lg:gap-y-[24px] lg:p-[20px] lg:w-[100%]',
  modelcard:
    'lg:bg-[#fff] lg:p-[24px] lg:flex lg:flex-col lg:items-center lg:w-[100%] lg:gap-y-[20px]',
  columnContainerAlignStart: 'lg:items-start',
  bgsec: 'lg:text-[#fff]',
  ContainerTop: 'lg:mt-[25px]',
  ligthBoldweight: 'lg:font-[600]',
  flexcol: 'lg:flex lg:flex-col lg:gap-y-[13px]',
  list: 'lg:flex lg:gap-x-[10px] lg:items-start',
  card: 'lg:bg-[#fff] lg:flex lg:flex-col lg:items-center lg:p-[24px] lg:w-[100%] lg:gap-y-[5px]',
  list: 'lg:flex lg:flex-col lg:gap-y-[4px] lg:p-[5px]',
  head: 'lg:flex lg:justify-between lg:items-center lg:p-[5px] lg:w-[100%] lg:whitespace-no-wrap',
  buttoncontentcenter: 'lg:justify-center lg:items-center',
  buttonicon: 'lg:bg-[transparent] lg:rounded-[none]',
  columnconvert: 'lg:flex lg:flex-col',
  sidebarlink:
    'lg:flex lg:gap-[10px] lg:p-[5px] lg:no-underline lg:text-[#4338ca]',
  parent:
    'lg:w-[100%] lg:bg-[#4338ca] lg:p-[20px] lg:gap-[10px] lg:flex lg:flex-col lg:font-sans',
  font: 'lg:text-[14px] lg:font-[600] lg:font-sans',
  maincard: 'lg:bg-[#fff] lg:w-[100%]',
  flexcolumn: 'lg:flex lg:flex-col lg:gap-y-[10px]',
  flexrow: 'lg:flex lg:items-center lg:gap-x-[1rem]',
  head: 'lg:text-[16px] lg:font-[600]',
  icontext: 'lg:flex lg:items-center lg:gap-[15px]',
  list: 'lg:w-[100%] lg:flex lg:flex-col lg:items-center lg:gap-[10px] lg:p-[10px]',
  TableCell: 'lg:w-[2%] lg:table-cell lg:py-[8px] lg:px-[15px]',
  inputTable: 'lg:w-[150px] lg:p-[10px]',
  borderdotted: 'lg:border-[2px] lg:border-dotted',
  fitcontent: 'lg:w-[fit-content]',
  center: 'lg:flex lg:items-center lg:justify-center',
  card: 'lg:flex lg:gap-[10px] lg:w-[100%] lg:p-[10px] lg:border-[1px] lg:border-solid lg:border-[rgb(142, 142, 142)]',
  gridcards: 'lg:grid lg:grid-cols-2 lg:gap-[20px]',
  textheaderrowcontainer: 'lg:justify-between lg:items-center lg:mb-[20px]',
};

export default commonUtilities;

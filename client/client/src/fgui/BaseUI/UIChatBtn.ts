/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

module BaseUI {

	export class UIChatBtn extends fairygui.GButton {
		public bg:fairygui.GImage;
		public describe:fairygui.GTextField;
		public nNumBg:fairygui.GImage;
		public unReadNum:fairygui.GTextField;
		public tipsGroup:fairygui.GGroup;
		public static URL:string = "ui://yaux2xpofjki11";

		public static createInstance():UIChatBtn {
			return <UIChatBtn>(fairygui.UIPackage.createObject("BaseUI", "ChatBtn"));
		}

		protected constructFromXML(xml:any):void {
			super.constructFromXML(xml);

			this.bg = <fairygui.GImage>(this.getChildAt(0));
			this.describe = <fairygui.GTextField>(this.getChildAt(1));
			this.nNumBg = <fairygui.GImage>(this.getChildAt(2));
			this.unReadNum = <fairygui.GTextField>(this.getChildAt(3));
			this.tipsGroup = <fairygui.GGroup>(this.getChildAt(4));
		}
	}
}
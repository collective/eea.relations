""" eea.relations viewlets
"""
try:
    from eea.themecentre.interfaces import IThemeTagging
except ImportError:
    from zope.interface import Interface
    class IThemeTagging(Interface):
        """ Dummy interface """

from plone.app.layout.viewlets.common import ViewletBase
from zope.component import getMultiAdapter
from Products.CMFCore.utils import getToolByName
from DateTime import DateTime
from zope.component._api import queryAdapter


class NextRelatedArticleViewlet(ViewletBase):
    """ Viewlet to show next available article
    """

    def available(self):
        """ Method that enables the viewlet only if we are on a
            view template
        """
        plone = getMultiAdapter((self.context, self.request),
                                name=u'plone_context_state')
        return plone.is_view_template()

    def get_related_article(self):
        """ Get related article
        """
        context = self.context
        if context.portal_type not in ['Article', 'News']:
            return ""
        catalog = getToolByName(context, 'portal_catalog')
        adapter = queryAdapter(context, IThemeTagging, default=None)
        if adapter is None:
            return ""

        theme_ids = adapter.tags
        if not theme_ids:
            return ""
        now = DateTime()
        query = {'review_state': 'published',
                 'sort_on': 'effective',
                 'sort_order': 'reverse',
                 'portal_type': ['Article', 'News', 'Fiche'],
                 'getThemes': theme_ids[0]
                 }
        date_range = {
            'query': (
                now - (3 * 30),
                now,
            ),
            'range': 'min:max',
        }
        context_url = context.absolute_url()
        query['effective'] = date_range
        res = catalog(query)
        if not res:
            return ""
        for brain in res:
            if brain.getURL() != context_url:
                return brain
        return res


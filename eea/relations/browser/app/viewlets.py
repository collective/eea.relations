""" eea.relations viewlets
"""
from plone.app.layout.viewlets.common import ViewletBase
from zope.component import getMultiAdapter
from Products.CMFCore.utils import getToolByName
from eea.themecentre.themecentre import getTheme
from DateTime import DateTime


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
        catalog = getToolByName(self.context, 'portal_catalog')
        context_themes = getTheme(self.context)
        now = DateTime()
        query = { 'review_state': 'published',
            'sort_on': 'effective',
            'portal_type': "Article",
            'getThemes': context_themes,
            'sort_order': 'reverse' }
        date_range = {
            'query': (
                now - (1 * 30),
                now,
            ),
            'range': 'min:max',
        }

        query['effective'] = date_range
        res = catalog(query)
        return res[0] if res else []